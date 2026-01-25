import { getResponseError } from '@lib/utils';
import {
  Card, Col,
  message, Row
} from 'antd';
import React, { useEffect, useState } from 'react';
import { performerService, studioService } from 'src/services';

import style from './commission-card.module.less';

const DataMap = [
  { lable: 'Tip Commission', key: 'tipCommission' },
  { lable: 'Private Call Commission', key: 'privateCallCommission' },
  { lable: 'Group Call Commission', key: 'groupCallCommission' },
  { lable: 'Product Commission', key: 'productCommission' },
  { lable: 'Gallery Commission', key: 'albumCommission' },
  { lable: 'Video Commission', key: 'videoCommission' }
];

interface IProps {
  role?: string;
}

function CommissionCard({
  role = 'performer'
}: IProps) {
  const [commission, setCommission] = useState(null);

  const getInfoStudio = () => studioService.me();

  useEffect(() => {
    const getCommission = async () => {
      try {
        const resp = role === 'studio'
          ? await getInfoStudio()
          : await performerService.getCommission();
        setCommission(resp.data);
      } catch (e) {
        const err = await Promise.resolve(e);
        message.error(getResponseError(err));
      }
    };
    getCommission();
  }, []);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {commission
        && (role === 'studio' ? (
          <Row gutter={[10, 10]}>
            {DataMap.map((m) => (
              <Col xs={24} sm={8} key={m.key}>
                <Card
                  className={style['card-commission']}
                  title={<span>{m.lable}</span>}
                  extra={(
                    <span className="commission-value">
                      {(commission && commission[m.key]) || 0}
                      %
                    </span>
                  )}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={[10, 10]}>
            {DataMap.map((m) => (
              <Col xs={24} sm={8} key={m.key}>
                <Card
                  className={style['card-commission']}
                  title={<span>{m.lable}</span>}
                  extra={(
                    <span className={style['commission-value']}>
                      {(commission && commission[m.key]) || 0}
                      %
                    </span>
                  )}
                />
              </Col>
            ))}
          </Row>
        ))}
    </>
  );
}

export default CommissionCard;
