# -*- coding: utf-8 -*-
# Generated by Django 1.10.7 on 2019-01-08 02:59
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('civictechprojects', '0020_volunteerrelation_is_co_owner'),
    ]

    operations = [
        migrations.AddField(
            model_name='volunteerrelation',
            name='application_date',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='volunteerrelation',
            name='last_reminder_date',
            field=models.DateTimeField(null=True),
        ),
        migrations.AddField(
            model_name='volunteerrelation',
            name='reminder_count',
            field=models.IntegerField(default=0),
        ),
    ]
