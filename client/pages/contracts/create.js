import React, { useState } from 'react';
import styled from 'styled-components';
import Cookie from 'js-cookie';
// import useAsync from 'react-use/lib/useAsync';
import useToggle from 'react-use/lib/useToggle';
import useForm from 'react-hook-form';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Auth from '@arcblock/react-forge/lib/Auth';

import Layout from '../../components/layout';
import useSession from '../../hooks/session';
import api from '../../libs/api';

function range(length) {
  return Array.from({ length }, (_, k) => k + 1);
}

export default function CreateContract() {
  const session = useSession();
  const { handleSubmit, register, errors } = useForm();
  const [signerCount, setSignerCount] = useState(2);
  const [open, toggle] = useToggle(false);

  const onSubmit = data => {
    console.log(JSON.stringify(data));
  };

  if (session.loading || !session.value) {
    return (
      <Layout title="Create Contract">
        <Main>
          <CircularProgress />
        </Main>
      </Layout>
    );
  }

  if (session.error) {
    return (
      <Layout title="Create Contract">
        <Main>{session.error.message}</Main>
      </Layout>
    );
  }

  if (!session.value.user) {
    Cookie.set('login_redirect', '/contracts/create');
    window.location.href = '/?openLogin=true';
    return null;
  }

  return (
    <Layout title="Create Contract">
      <Main>
        {open && (
          <Dialog open maxWidth="sm" disableBackdropClick disableEscapeKeyDown onClose={() => toggle()}>
            <Auth
              action="payment"
              checkFn={api.get}
              onClose={() => toggle()}
              onSuccess={() => window.location.reload()}
              messages={{
                title: 'Payment Required',
                scan: 'Pay 5 TBA to view secret documented',
                confirm: 'Confirm payment on your ABT Wallet',
                success: 'You have successfully paid!',
              }}
            />
          </Dialog>
        )}
        <div className="form">
          <Typography component="h3" variant="h4" className="form-header">
            Create New Contract
          </Typography>
          <form className="form-body" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Contract Name"
              className="input input-title"
              margin="normal"
              variant="outlined"
              fullWidth
              error={!!errors.title}
              helperText={errors.title || ''}
              inputRef={register({ required: true })}
              InputProps={{
                type: 'text',
                name: 'title',
                placeholder: 'Employment contract',
              }}
            />
            <TextField
              label="Contract Description"
              className="input input-synopsis"
              margin="normal"
              variant="outlined"
              fullWidth
              error={!!errors.synopsis}
              helperText={errors.synopsis || ''}
              inputRef={register({ required: true })}
              InputProps={{
                type: 'text',
                name: 'synopsis',
                placeholder: 'Brief summary of the contract',
              }}
            />
            <TextField
              label="Contract Content"
              className="input input-content"
              margin="normal"
              variant="outlined"
              fullWidth
              multiline
              rows={10}
              rowsMax={20}
              error={!!errors.content}
              inputRef={register({ required: true })}
              helperText={errors.content || ''}
              InputProps={{
                type: 'textarea',
                name: 'content',
                placeholder: 'Pates the full text of the contract here',
              }}
            />

            <div className="signers">
              <div className="signer-inputs">
                {range(signerCount).map(i => {
                  const key = `signers[${i}]`;
                  return (
                    <TextField
                      key={key}
                      label="Signer Email"
                      className="input input-signer-email"
                      placeholder="Signer Email"
                      variant="outlined"
                      margin="normal"
                      error={!!errors[key]}
                      helperText={errors[key] || ''}
                      inputRef={register({ required: true })}
                      InputProps={{
                        type: 'text',
                        name: key,
                      }}
                    />
                  );
                })}
              </div>
              <div className="signer-actions">
                <IconButton type="button" size="small" onClick={() => setSignerCount(signerCount + 1)}>
                  <AddIcon />
                </IconButton>
                <IconButton type="button" size="small" onClick={() => setSignerCount(signerCount - 1)}>
                  <DeleteIcon />
                </IconButton>
              </div>
            </div>

            <Button type="submit" size="large" variant="contained" color="primary">
              Create Contract
            </Button>
          </form>
        </div>
      </Main>
    </Layout>
  );
}

const Main = styled.main`
  margin: 80px 0;

  .form {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .form-body {
    max-width: 80%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }

  .input {
  }

  .signers {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    .input-signer-email {
      margin-right: 32px;
    }

    .signer-actions {
      display: flex;
    }

    margin-bottom: 50px;
  }
`;
