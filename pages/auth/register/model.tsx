import { postService } from '@services/post.service';
import { settingService } from '@services/setting.service';
import { message } from 'antd';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { connect, ConnectedProps, useSelector } from 'react-redux';

import style from './model-register.module.less';

const PageTitle = dynamic(() => import('@components/common/page-title'));
const FormRegisterPlaceHolder = dynamic(() => import('@components/common/layout').then((res) => res.FormRegisterPlaceHolder));
const ModelRegisterForm = dynamic(() => import('@components/auth/register/model-register-form'));

interface IProps {
  settings: any;
  linkToAgreementContent: string;
}

const mapStates = (state) => ({
  loggedIn: state.auth.loggedIn,
  singularTextModel: state.ui.singularTextModel
});

const connector = connect(mapStates);

type PropsFromRedux = ConnectedProps<typeof connector>;

function PerformerRegisterPage({
  loggedIn,
  singularTextModel,
  settings,
  linkToAgreementContent
}: PropsFromRedux & IProps) {
  const router = useRouter();
  const placeholderLoginUrl = useSelector((state: any) => state.ui.placeholderLoginUrl);
  useEffect(() => {
    if (loggedIn) {
      message.info('Logged in!');
      router.push('/');
    }
  }, [loggedIn]);

  const pageTitle = `${singularTextModel} Sign-up`;
  return (
    <div className={style['register-page']}>
      <PageTitle title={pageTitle} />
      <div className="form-register-container">
        <ModelRegisterForm
          googleReCaptchaEnabled={settings?.googleReCaptchaEnabled}
          googleReCaptchaSiteKey={settings?.googleReCaptchaSiteKey}
          linkToAgreementContent={linkToAgreementContent}
        />
      </div>
      <FormRegisterPlaceHolder placeholderLoginUrl={placeholderLoginUrl} />
    </div>
  );
}

PerformerRegisterPage.getInitialProps = async () => {
  try {
    const metaSettings = await settingService.valueByKeys([
      'googleReCaptchaEnabled',
      'googleReCaptchaSiteKey',
      'placeholderLoginUrl',
      'providerAgreementContent'
    ]);

    if (metaSettings.data.providerAgreementContent) {
      const resp = await postService.findById(metaSettings.data.providerAgreementContent);
      return {
        settings: metaSettings.data,
        linkToAgreementContent: resp.data.slug
      };
    }

    return {
      settings: metaSettings.data,
      linkToAgreementContent: ''
    };
  } catch (e) {
    return {
      settings: null,
      linkToAgreementContent: ''
    };
  }
};

export default connector(PerformerRegisterPage);
