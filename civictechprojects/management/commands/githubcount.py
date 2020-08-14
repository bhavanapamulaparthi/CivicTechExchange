import boto3
import requests
import pandas as pd
import common.helpers.github as gt
from datetime import datetime, timedelta
from civictechprojects.models import Project, ProjectLink
from django.core.management.base import BaseCommand, CommandError

github_api_endpoint = 'https://api.github.com'


class Command(BaseCommand):
    def get_owner_names(self):
        owners_list = ProjectLink.objects.filter(link_name='link_coderepo').values('link_url')
        owners = []
        # owners = ['DemocracyLab', 'townhallproject', 'orcasound', 'foodislifeBGP', 'openseattle', 'CouncilDataProject',
        #         'dabreegster', 'SeattleVoluntech', 'SeattleCUTGroup', 'ose', 'mapseed']
        for row in owners_list:
            owners.append(row['link_url'].split('/')[3])
        return owners

    def proj_joined_date(owner):
        join_date = None
        created_dates_list = Project.objects.all().values('project_name', 'project_date_created')
        # print(created_dates_list)
        print(owner)
        for row in created_dates_list:
            if owner in row['project_name'].lower().replace(' ', ''):
                join_date = row['project_date_created'].date()
                print("Join_date is:" +str(join_date))
        return join_date

# function to upload file to aws s3

    def upload_file(file_name, bucket, object_name=None):
        if object_name is None:
            object_name = file_name
        try:
            s3 = boto3.client('s3')
            s3.upload_file(file_name, bucket, object_name)
            print("uploaded")
        except FileNotFoundError:
            print("File not found")
        except Exception as e:
            print("Found an exception :", e)

    upload_file('/Users/harish/CivicTechExchange/Average_commit_report.csv',
                'civictechprojcsvreport', 'Proj_avg_commits.csv')


    def handle(self, *args, **options):     # main function class Command
        headers = {"Authorization": "token 7e867f0b888bd2dffe218f02b62f77d82876c0c7"}
        owner_names = Command.get_owner_names(self)
        print(owner_names)
        key = 1
        report_dic = {}
        for owner in owner_names:
            join_date = Command.proj_joined_date(owner.lower())
            if join_date is None:
                print("owner not found :" +owner)
                continue
            else:
                # dl_join_date = datetime.strptime(join_date, '%Y-%m-%d').date()
                # since = dl_join_date - timedelta(days=365)
                # since = datetime.strptime(join_date.date() - timedelta(days=365), '%Y-%m-%d').date()
                since = (join_date - timedelta(days=365))
                # print(since)
                repo_names = gt.get_repos_for_user(owner)

                for rep in repo_names:
                    repo = rep[1]
                    pre_count, post_count = 0, 0
                    page_size = 1
                    page_index = 0

                    commits_url = '{github}/repos/{owner}/{repo}/commits?since={since_date}&per_page=100&page={page_index}'.format(
                        github=github_api_endpoint,
                        owner=owner,
                        repo=repo,
                        since_date=since,
                        page_index=page_index)

                    response = requests.get(commits_url, headers=headers).json()

                    if 'message' in response:
                        print('Repo not found in github '+repo+' Unable to read ' + commits_url + ': ' + response['message'])

                        report_dic[key] = [owner, repo, join_date, 0, 0, 0]
                        key += 1

                    else:
                        while page_size >= 1:
                            for i in response:
                                dt = i.get('commit').get('author').get('date')
                                commit_date = datetime.strptime(dt, '%Y-%m-%dT%H:%M:%SZ').date()
                                if (commit_date) < join_date:
                                    pre_count += 1
                                else:
                                    post_count += 1
                            page_index += 1
                            commits_url = '{github}/repos/{owner}/{repo}/commits?since={since_date}&per_page=100&page={page}'.format(
                                github=github_api_endpoint,
                                owner=owner,
                                repo=repo,
                                since_date=since,
                                page=page_index)

                            response = requests.get(commits_url, headers=headers).json()
                            if 'message' in response:
                                # print('Unable to read ' + commits_url + ': ' + response['message'])
                                page_size = 0
                            else:
                                page_size = len(response)

                        print("Post Commit Count of the ", repo, post_count)
                        print("Pre Commit count of the ", repo, pre_count)

                        pre_join_avg = Command.get_pre_join_avg(owner, repo, join_date, pre_count, since)
                        post_join_avg = Command.get_post_join_avg(join_date, post_count)
                        try:
                            change_in_avg = ((post_join_avg - pre_join_avg) / pre_join_avg) * 100
                        except ZeroDivisionError:
                            print("Unable get change_in_avg for repo: " + repo + " ZeroDivisionError occured")
                            change_in_avg = 0

                        report_dic[key] = [owner, repo, join_date, pre_join_avg, post_join_avg, change_in_avg]
                        key += 1

        df = pd.DataFrame(report_dic.values())
        df.columns = ['Project Name', 'Repo Name', 'Date Joined Democracylab', 'Avg Commits/wk before joining',
                      'Avg Commits/wk after joining', 'Change in Avg Commits after joining']
        df.to_csv('/Users/harish/CivicTechExchange/Average_commit_report.csv')

# upload_file function call to upload file to aws s3

    upload_file('/Users/harish/CivicTechExchange/Average_commit_report.csv',
                    'civictechprojcsvreport', 'Proj_avg_commits.csv')

    def get_pre_join_avg(owner, repo_name, join_date, pre_count, since):
        repo_url = '{github}/repos/{owner}/{repo}'.format(github=github_api_endpoint, owner=owner,
                                                          repo=repo_name)
        headers = {"Authorization": "token 7e867f0b888bd2dffe218f02b62f77d82876c0c7"}
        response = requests.get(repo_url, headers=headers)
        try:
            repo_info = response.json()
            if 'message' in repo_info:
                print('Unable to read ' + repo_url + ': ' + repo_info['message'])
            else:
                # repo_created_date = repo_info['created_at']
                # create_date = datetime.strptime(repo_created_date, '%Y-%m-%dT%H:%M:%SZ').date()
                days = abs(since - join_date).days
                weeks = days // 7
                pre_avg_commits = pre_count // weeks

        except:
            print('Invalid json: ' + repo_url)
            return None

        return pre_avg_commits

    def get_post_join_avg(join_date, post_count):
        days = abs(join_date - datetime.now().date()).days
        weeks = days // 7
        post_avg_commits = post_count // weeks

        return post_avg_commits


