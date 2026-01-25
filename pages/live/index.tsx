import PageTitle from '@components/common/page-title';
import dynamic from 'next/dynamic';
import { connect, ConnectedProps } from 'react-redux';

const ModelPublicStreamWithChatbox = dynamic(() => import('@components/streaming/model-public-stream-with-chatbox'), {
  suspense: false
});

const mapStates = (state) => ({
  performer: state.performer.current
});

const connector = connect(mapStates);

type PropsFromRedux = ConnectedProps<typeof connector>;

function PerformerLivePage({
  performer
}: PropsFromRedux) {
  return (
    <>
      <PageTitle title="Go Live" />
      <ModelPublicStreamWithChatbox performer={performer} />
    </>
  );
}

PerformerLivePage.authenticate = true;
PerformerLivePage.layout = 'stream';
export default connector(PerformerLivePage);
