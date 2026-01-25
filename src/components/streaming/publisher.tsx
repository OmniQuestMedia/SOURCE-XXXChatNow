/* eslint-disable camelcase */
import { getResponseError } from '@lib/utils';
import { message } from 'antd';
import classnames from 'classnames';
import Router from 'next/router';
import { PureComponent } from 'react';
import { isMobile } from 'react-device-detect';
import withAntmedia from 'src/antmedia';
import { WEBRTC_ADAPTOR_INFORMATIONS } from 'src/antmedia/constants';
import {
  WebRTCAdaptorConfigs,
  WebRTCAdaptorProps
} from 'src/antmedia/interfaces';
import { LocalStream } from 'src/antmedia/LocalStream';
import { StreamSettings } from 'src/interfaces';
import { streamService } from 'src/services';
import MicControlsPlugin from 'src/videojs/mic-controls/plugin';
import videojs from 'video.js';

import style from './publisher.module.less';

interface IProps extends WebRTCAdaptorProps {
  settings: StreamSettings;
  configs: Partial<WebRTCAdaptorConfigs>;
}

class Publisher extends PureComponent<IProps> {
  private publisher: videojs.Player;

  constructor(props: IProps) {
    super(props);
  }

  componentDidMount() {
    videojs.registerPlugin('webRTCMicControlsPlugin', MicControlsPlugin);
    Router.events.on('routeChangeStart', this.onbeforeunload);
    // window.addEventListener('beforeunload', this.onbeforeunload);
  }

  componentWillUnmount() {
    Router.events.off('routeChangeStart', this.onbeforeunload);
    // window.removeEventListener('beforeunload', this.onbeforeunload);
  }

  onbeforeunload = () => {
    if (this.publisher) {
      this.publisher.dispose();
      this.publisher = undefined;
    }
  };

  async startPublishing(idOfStream: string) {
    const { webRTCAdaptor, leaveSession, settings } = this.props;
    try {
      const token = await streamService.getPublishToken({
        streamId: idOfStream,
        settings
      });
      webRTCAdaptor.publish(idOfStream, token);
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
      leaveSession();
    }
  }

  // call via ref
  // eslint-disable-next-line react/no-unused-class-component-methods
  public publish(streamId: string) {
    const { initialized } = this.props;
    initialized && this.startPublishing(streamId);
  }

  // call via ref
  // eslint-disable-next-line react/no-unused-class-component-methods
  public start() {
    const { initWebRTCAdaptor, initialized, publishStarted } = this.props;
    const { localStream } = this.props;
    if (initialized && !publishStarted && localStream) {
      this.startPublishing(localStream);
    }

    initWebRTCAdaptor(this.handelWebRTCAdaptorCallback.bind(this));
  }

  handelWebRTCAdaptorCallback(info: WEBRTC_ADAPTOR_INFORMATIONS) {
    if (info === WEBRTC_ADAPTOR_INFORMATIONS.PUBLISH_STARTED || info === WEBRTC_ADAPTOR_INFORMATIONS.SESSION_RESTORED_DESCRIPTION) {
      /**
       * use video js for desktop view
       * ant media will play video by localId, we dont need to add videojs layer in mobile
       */
      if (!isMobile) {
        const { configs, muteLocalMic, unmuteLocalMic } = this.props;
        const player = videojs(configs.localVideoId, {
          liveui: true,
          controls: true,
          muted: true,
          bigPlayButton: false,
          controlBar: {
            volumePanel: false,
            playToggle: false,
            fullscreenToggle: true,
            currentTimeDisplay: false,
            pictureInPictureToggle: false,
            liveDisplay: false
          }
        }, () => {
          player.hasStarted(true);
          if (player.hasPlugin('webRTCMicControlsPlugin')) {
            player.webRTCMicControlsPlugin({
              muteLocalMic,
              unmuteLocalMic,
              isMicMuted: false
            });
          }
          this.publisher = player;
        });
        player.on('error', () => {
          player.error(null);
        });
      }
    }
  }

  render() {
    const {
      publishStarted,
      classNames,
      configs: { localVideoId }
    } = this.props;
    return (
      <div>
        <LocalStream
          id={localVideoId}
          hidden={!publishStarted}
          classNames={classnames(classNames, 'vjs-16-9')}
        />
        {publishStarted && (
        <div className="text-center">
          <span className={style.publishing}>Publishing</span>
        </div>
        )}
      </div>
    );
  }
}

export const LivePublisher = withAntmedia<{}>(Publisher);
export default LivePublisher;
