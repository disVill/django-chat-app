import * as cdk from '@aws-cdk/core';
import * as ecr from '@aws-cdk/aws-ecr'
import * as pipeline from '@aws-cdk/aws-codepipeline';
import * as s3 from '@aws-cdk/aws-s3'
import * as actions from '@aws-cdk/aws-codepipeline-actions'

interface AppStackProps extends cdk.StackProps {
  sourceRepo: ecr.Repository
  mediaBucket: s3.Bucket
};

export class DeploymentsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: AppStackProps) {
    super(scope, id, props);
    const appName = this.node.tryGetContext('appName');
    const params = this.node.tryGetContext('params');

    const codePipeline = new pipeline.Pipeline(this, 'codePipeline', {
      pipelineName: `${appName}-pipeline`,
      crossAccountKeys: false,
    })

    const sourceOutput = new pipeline.Artifact();

    codePipeline.addStage({
      stageName: 'Source',
      actions: [new actions.GitHubSourceAction({
        actionName: 'GithubAction',
        // @ts-ignore
        oauthToken: cdk.SecretValue.secretsManager(params.github.arn),
        branch: params.github.branch,
        output: sourceOutput,
        owner: params.github.owner,
        repo: params.github.repo,
        trigger: actions.GitHubTrigger.POLL,
      })]
    })
  }
}
