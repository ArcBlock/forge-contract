import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Cookie from 'js-cookie';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import styled from 'styled-components';

import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import Layout from '../../components/layout';

import useSession from '../../hooks/session';
import api from '../../libs/api';

export default function ContractDetail({ query }) {
  const [isContractLoaded, setContractLoaded] = useState(false);
  const session = useSession();
  const [contract, fetchContract] = useAsyncFn(async () => {
    const res = await api.get(`/api/contracts/${query.id}`);
    if (res.status === 200) {
      res.data.content = Buffer.from(res.data.content, 'base64').toString('utf8');
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
        <div className="form">
          <Typography component="h3" variant="h4" className="form-header">
            Contract Detail
          </Typography>
          <pre>
            <code>{JSON.stringify(contract.value, true, '  ')}</code>
          </pre>
        </div>
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
`;
