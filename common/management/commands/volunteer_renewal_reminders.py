from django.conf import settings
from django.core.mail import EmailMessage
from django.core.management.base import BaseCommand
from django.utils import timezone
from common.helpers.date_helpers import DateTimeFormats, datetime_field_to_datetime, datetime_to_string
from democracylab.emails import send_email,_get_account_from_email, send_volunteer_conclude_email, HtmlEmailTemplate, \
    notify_project_owners_volunteer_concluded_email


class Command(BaseCommand):
    def handle(self, *args, **options):
        if not settings.VOLUNTEER_RENEW_REMINDER_PERIODS:
            print('Please set VOLUNTEER_RENEW_REMINDER_PERIODS before running volunteer_renewal_reminders')
            return

        now = timezone.now()

        from civictechprojects.models import VolunteerRelation
        volunteer_applications = VolunteerRelation.objects.all()
        for volunteer_relation in volunteer_applications:
            if volunteer_relation.is_up_for_renewal(now):
                if now > volunteer_relation.projected_end_date:
                    if volunteer_relation.is_approved:
                        # Don't send conclusion emails if volunteer wasn't approved
                        send_volunteer_conclude_email(volunteer_relation.volunteer, volunteer_relation.project.project_name)
                        notify_project_owners_volunteer_concluded_email(volunteer_relation)
                    volunteer_relation.delete()
                elif volunteer_relation.is_approved:
                    # Don't send reminders if volunteer isn't approved
                    email_template = get_reminder_template_if_time(now, volunteer_relation)
                    if email_template:
                        send_reminder_email(email_template, volunteer_relation)
                        volunteer_relation.re_enroll_reminder_count += 1
                        volunteer_relation.re_enroll_last_reminder_date = now
                        volunteer_relation.save()


def get_reminder_template_if_time(now, volunteer):
    reminder_interval_days = settings.VOLUNTEER_RENEW_REMINDER_PERIODS

    if not volunteer.re_enroll_last_reminder_date:
        return volunteer_reminder_emails[0]
    else:
        days_since_last_reminder = (now - volunteer.re_enroll_last_reminder_date).days
        days_to_next_reminder = reminder_interval_days[min(volunteer.re_enroll_reminder_count, len(reminder_interval_days) - 1)]
        return (days_to_next_reminder > 0) and (days_since_last_reminder >= days_to_next_reminder) and volunteer_reminder_emails[volunteer.re_enroll_reminder_count]


def send_reminder_email(email_template, volunteer_relation):
    project = volunteer_relation.project
    volunteer = volunteer_relation.volunteer
    context = {
        'first_name': volunteer.first_name,
        'project_name': project.project_name,
        'project_end_date': datetime_to_string(datetime_field_to_datetime(volunteer_relation.projected_end_date), DateTimeFormats.DATE_LOCALIZED),
        'volunteer_start_date': datetime_to_string(datetime_field_to_datetime(volunteer_relation.application_date), DateTimeFormats.DATE_LOCALIZED)
    }

    email_msg = EmailMessage(
        subject="You're making a difference at " + project.project_name,
        from_email=_get_account_from_email(settings.EMAIL_VOLUNTEER_ACCT),
        to=[volunteer.email],
    )

    email_msg = email_template.render(email_msg, context)
    send_email(email_msg, settings.EMAIL_VOLUNTEER_ACCT)


review_commitment_url = settings.PROTOCOL_DOMAIN + '/index/?section=MyProjects&from=renewal_notification_email'


def get_first_email_template():
    return HtmlEmailTemplate() \
        .header("You're making a difference at {{project_name}}") \
        .paragraph("We'd like to take this opportunity to thank you for your support since {{volunteer_start_date}}.  "
                   "Your engagement with {{project_name}} is extremely important to us and is much appreciated.") \
        .paragraph("That said, we know you’re busy and just wanted to take this time to remind you that your "
                   "volunteer commitment with {{project_name}} will expire on {{project_end_date}}.") \
        .paragraph("We hope that you’ll take this time to renew your volunteer commitment and remain a part of our community.") \
        .button(url=review_commitment_url, text='REVIEW COMMITMENT')


def get_second_email_template():
    return HtmlEmailTemplate() \
        .header("You're essential to the success of {{project_name}}") \
        .paragraph("{{first_name}},") \
        .paragraph("We can't thank you enough for all the positive energy you're putting into our tech-for-good " 
                   "community, we wouldn't be able to do this without your help!") \
        .paragraph("We think you're a socially-conscious individual with a big heart and recognize that you're " 
                   "essential to the success of {{project_name}}.  We hope that you continue adding value to our " 
                   "community by taking this time to renew your volunteer commitment at {{project_name}}.") \
        .button(url=review_commitment_url, text='RENEW TODAY')

volunteer_reminder_emails = [get_first_email_template(), get_second_email_template()]
