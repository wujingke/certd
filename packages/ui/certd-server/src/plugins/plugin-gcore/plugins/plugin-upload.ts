import { AbstractTaskPlugin, IsTaskPlugin, pluginGroups, RunStrategy, TaskInput } from '@certd/pipeline';
import { CertInfo } from '@certd/plugin-cert';
import { GcoreAccess } from '../access.js';

@IsTaskPlugin({
  name: 'Gcoreupload',
  title: '部署证书到 Gcore',
  desc: '仅上传 并不会部署到cdn',
  icon: 'clarity:plugin-line',
  group: pluginGroups.cdn.key,
  default: {
    strategy: {
      runStrategy: RunStrategy.SkipWhenSucceed,
    },
  },
})
export class GcoreuploadPlugin extends AbstractTaskPlugin {
  @TaskInput({
    title: '证书名称',
    helper: '作为备注',
  })
  certName!: string;

  @TaskInput({
    title: '域名证书',
    helper: '请选择前置任务输出的域名证书',
    component: {
      name: 'output-selector',
      from: ['CertApply', 'CertApplyLego'],
    },
    required: true,
  })
  cert!: CertInfo;
  @TaskInput({
    title: 'Access授权',
    helper: 'Gcore',
    component: {
      name: 'access-selector',
      type: 'Gcore',
    },
    required: true,
  })
  accessId!: string;
  private readonly baseApi = 'https://api.gcore.com';

  async onInstance() {}

  private async doRequestApi(url: string, data: any = null, method = 'post', token: string | null = null) {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    };
    const res = await this.http.request<any, any>({
      url,
      method,
      data,
      headers,
    });

    return res;
  }

  async execute(): Promise<void> {
    const { cert, accessId } = this;
    const access = (await this.accessService.getById(accessId)) as GcoreAccess;
    let otp = null;
    if (access.otpkey) {
      const response = await this.http.request<any, any>({
        url: `https://cn-api.my-api.cn/api/totp/?key=${access.otpkey}`,
        method: 'get',
      });
      otp = response;
      this.logger.info('获取到otp:', otp);
    }
    const loginResponse = await this.doRequestApi(`${this.baseApi}/iam/auth/jwt/login`, {
      username: access.username,
      password: access.password,
      ...(otp && { otp }),
    });
    const token = loginResponse.access;
    this.logger.info('Token 获取成功');
    this.logger.info('开始上传证书');
    await this.doRequestApi(
      `${this.baseApi}/cdn/sslData`,
      {
        name: this.certName,
        sslCertificate: cert.crt,
        sslPrivateKey: cert.key,
        validate_root_ca: true,
      },
      'post',
      token
    );
    this.logger.info('证书上传成功');
  }
}

new GcoreuploadPlugin();
