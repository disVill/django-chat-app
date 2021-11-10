import * as cdk from '@aws-cdk/core';
import * as ecr from '@aws-cdk/aws-ecr'
import * as pipeline from '@aws-cdk/aws-codepipeline';
import * as s3 from '@aws-cdk/aws-s3';
import * as actions from '@aws-cdk/aws-codepipeline-actions';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as rds from '@aws-cdk/aws-rds';
import * as elasticache from '@aws-cdk/aws-elasticache';

interface AppStackProps extends cdk.StackProps {
  db: rds.DatabaseInstance
  redis: elasticache.CfnCacheCluster
  sourceRepo: ecr.Repository
  mediaBucket: s3.Bucket
};

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: AppStackProps) {
    super(scope, id, props);
    const appName = this.node.tryGetContext('appName');
    const params = this.node.tryGetContext('params');

    const codePipeline = new pipeline.Pipeline(this, 'codePipeline', {
      pipelineName: `${appName}-pipeline`,
      crossAccountKeys: false,
    })

    const project = new codebuild.PipelineProject(this, 'CodeBuild', {
      projectName: 'CodeBuildProject',
      buildSpec: codebuild.BuildSpec.fromSourceFilename('./buildspeck.yml'),
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2,
        computeType: codebuild.ComputeType.SMALL,
        privileged: true,
      },
      environmentVariables: {
        DB_URL: {
          value: params.db.dbUrl
        }
      }
    });

    const sourceOutput = new pipeline.Artifact();
    const buildOutput = new pipeline.Artifact();

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
    });
    codePipeline.addStage({
      stageName: 'Build',
      actions: [new actions.CodeBuildAction({
        actionName: 'CodeBuild',
        input: sourceOutput,
        project,
        outputs: [buildOutput],
      })]
    });
    
  }
}
