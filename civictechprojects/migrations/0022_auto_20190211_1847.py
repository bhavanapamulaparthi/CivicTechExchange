# -*- coding: utf-8 -*-
# Generated by Django 1.10.7 on 2019-02-11 18:47
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('civictechprojects', '0021_auto_20190108_0259'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='project_date_created',
            field=models.DateTimeField(null=True),
        ),
        migrations.AddField(
            model_name='volunteerrelation',
            name='approved_date',
            field=models.DateTimeField(null=True),
        ),
    ]
