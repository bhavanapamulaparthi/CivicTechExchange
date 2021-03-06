# -*- coding: utf-8 -*-
# Generated by Django 1.10.7 on 2017-11-25 21:44
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import taggit.managers


class Migration(migrations.Migration):

    dependencies = [
        ('taggit', '0002_auto_20150616_2121'),
        ('civictechprojects', '0002_auto_20171119_2223'),
    ]

    operations = [
        migrations.CreateModel(
            name='TaggedIssueAreas',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='TaggedTag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.RemoveField(
            model_name='project',
            name='project_issue_area',
        ),
        migrations.AlterField(
            model_name='project',
            name='project_tags',
            field=taggit.managers.TaggableManager(blank=True, help_text='A comma-separated list of tags.', through='civictechprojects.TaggedTag', to='taggit.Tag', verbose_name='Tags'),
        ),
        migrations.AddField(
            model_name='taggedtag',
            name='content_object',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='civictechprojects.Project'),
        ),
        migrations.AddField(
            model_name='taggedtag',
            name='tag',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='civictechprojects_taggedtag_items', to='taggit.Tag'),
        ),
        migrations.AddField(
            model_name='taggedissueareas',
            name='content_object',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='civictechprojects.Project'),
        ),
        migrations.AddField(
            model_name='taggedissueareas',
            name='tag',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='civictechprojects_taggedissueareas_items', to='taggit.Tag'),
        ),
        migrations.AddField(
            model_name='project',
            name='project_issue_area',
            field=taggit.managers.TaggableManager(blank=True, help_text='A comma-separated list of tags.', through='civictechprojects.TaggedIssueAreas', to='taggit.Tag', verbose_name='Tags'),
        ),
    ]
