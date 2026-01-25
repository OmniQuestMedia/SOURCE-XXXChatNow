import {
  DeleteOutlined, LogoutOutlined, PlusOutlined
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import React from 'react';

import styles from './CommunityConversationListItem.module.less';

interface Iprops {
  currentUser: any;
  data: any;
  setActive: Function;
  selected: boolean;
  deleteTheConversation: Function;
  userLeaveTheConversation: Function;
  userJoinTheConversation?: Function;
}

export default function CommunityConversationListItem({
  currentUser,
  data,
  setActive,
  selected,
  deleteTheConversation,
  userLeaveTheConversation,
  userJoinTheConversation = null
}: Iprops) {
  const className = selected
    ? `${styles['conversation-list-item']} active`
    : styles['conversation-list-item'];

  return (
    <div
      aria-hidden="true"
      className={className}
    >
      <div className={styles.conversation} aria-hidden="true" onClick={() => setActive(data._id)}>
        <Tooltip title={data.name}>
          <span className={styles['conversation-name']}>{data.name || 'N/A'}</span>
        </Tooltip>
        {' '}
      </div>
      <div style={{ marginLeft: 'auto' }}>
        {deleteTheConversation && currentUser && currentUser.isPerformer && currentUser._id === data.performerId && (
        <span>
          <Tooltip title="Delete conversation">
            <DeleteOutlined onClick={() => {
              deleteTheConversation(data._id);
            }}
            />
          </Tooltip>
        </span>
        )}

        {userLeaveTheConversation && currentUser && !currentUser.isPerformer && (
        <span>
          <Tooltip title="Leave the conversation">
            <LogoutOutlined onClick={() => userLeaveTheConversation(data._id)} />
          </Tooltip>
        </span>
        )}

        {userJoinTheConversation && (
        <span>
          <Tooltip title="Join conversation">
            <PlusOutlined onClick={() => userJoinTheConversation(data._id)} />
          </Tooltip>
        </span>
        )}
      </div>
    </div>
  );
}
