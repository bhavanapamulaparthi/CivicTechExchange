# -*- coding: utf-8 -*-
# Generated by Django 1.10.7 on 2018-07-14 05:33
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('civictechprojects', '0012_auto_20180626_1535'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserAlert',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254)),
                ('filters', models.CharField(max_length=2083)),
                ('country', models.CharField(max_length=2)),
                ('postal_code', models.CharField(max_length=20)),
            ],
        ),
    ]
