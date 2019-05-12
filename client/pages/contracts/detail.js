/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Cookie from 'js-cookie';
import moment from 'moment';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import styled from 'styled-components';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import Layout from '../../components/layout';
import DidLink from '../../components/did_link';

import useSession from '../../hooks/session';
import api from '../../libs/api';

export default function ContractDetail({ query }) {
  const [isContractLoaded, setContractLoaded] = useState(false);
  const session = useSession();
  const [contract, fetchContract] = useAsyncFn(async () => {
    const res = await api.get(`/api/contracts/${query.id}`);
    if (res.status === 200) {
      res.data.content = Buffer.from(res.data.content, 'base64')
        .toString('utf8')
        .split('\n\r')
        .join('<br/><br/>');

      return res.data;
    }

    throw new Error(res.data.error || 'Contract load failed');
  }, [session.value]);

  if (session.loading || !session.value) {
    return (
      <Layout title="Contract">
        <Main>
          <CircularProgress />
        </Main>
      </Layout>
    );
  }

  if (session.error) {
    return (
      <Layout title="Contract">
        <Main>{session.error.message}</Main>
      </Layout>
    );
  }

  if (!session.value.user) {
    Cookie.set('login_redirect', window.location.href);
    window.location.href = '/?openLogin=true';
    return null;
  }

  if (!isContractLoaded) {
    fetchContract();
    setContractLoaded(true);
  }

  return (
    <Layout title="Contract">
      <Main>
        {(contract.loading || !contract.value) && <CircularProgress />}
        {contract.error && (
          <Typography component="p" color="secondary">
            {contract.error.message}
          </Typography>
        )}
        {contract.value && (
          <React.Fragment>
            <div className="summary">
              <Typography component="h3" variant="h4" className="title">
                Contract Status
              </Typography>
              <Typography component="p" variant="subheading" className="meta" gutterBottom>
                <strong>{contract.value.signatures.filter(x => x.signature).length}</strong> of{' '}
                <strong>{contract.value.signatures.length}</strong> have signed
              </Typography>
              <div className="signers">
                {contract.value.signatures.map(x => (
                  // eslint-disable-next-line no-underscore-dangle
                  <Paper key={x._id} className="signer">
                    <Typography className="signer__email" component="p" variant="h6">
                      {x.email}
                    </Typography>
                    {session.value.user.email === x.email && !x.signature && (
                      <Button variant="contained" className="signer__button" color="primary">
                        Sign
                      </Button>
                    )}
                  </Paper>
                ))}
              </div>
            </div>
            <div className="detail">
              <Typography component="h3" variant="h4" className="title">
                {contract.value.synopsis}
              </Typography>
              <Typography component="p" variant="subheading" className="meta">
                Created by <DidLink did={contract.value.requester} /> on{' '}
                <strong>{moment(contract.value.createdAt).format('YYYY-MM-DD HH:mm')}</strong>
              </Typography>
              <Paper className="content">
                <Typography
                  component="p"
                  dangerouslySetInnerHTML={{ __html: contract.value.content }}
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                />
              </Paper>
            </div>
          </React.Fragment>
        )}
      </Main>
    </Layout>
  );
}

ContractDetail.getInitialProps = ({ query }) => ({ query });

ContractDetail.propTypes = {
  query: PropTypes.object.isRequired,
};

const Main = styled.main`
  margin: 80px 0;
  display: flex;

  .title {
    margin-bottom: 24px;
  }

  .meta {
    margin-bottom: 30px;
  }

  .summary {
    width: 320px;
    flex-shrink: 0;
    margin-right: 50px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-center;
    .signers {
      display: flex;
      flex-direction: column;
    }

    .signer {
      padding: 24px;
      text-align: center;
      position: relative;

      .signer__email {
      }

      .signer__button {
      }
    }
  }

  .detail {
    .content {
      padding: 32px;
      font-size: 1.2rem;
      text-align: left;
    }
  }
`;
