import React from 'react';
import logo from './logo.svg';
import './App.css';



import {
  Button,
  Card,
  Divider,
  TextField,
  Stack,
  Box,
  Menu,
  MenuItem,
  Alert,
  IconButton,
  Typography,
  styled,
} from '@mui/material';

import { Close, MoreVert } from '@mui/icons-material';
const endpoint = "https://58uf2seho0.execute-api.us-east-1.amazonaws.com/"
const setItem = async (name) => {
  // build request options
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  };

  // send POST request
  const response = await fetch(endpoint, requestOptions);
  try {
    return await response.json();

  } catch (message) {
    return { message }
  }
}
    


const Image = styled('img')(({ theme }) => ({
  width: 180,
  height: 180,
  margin: theme.spacing(2),
  outline: 'solid 1px #37a',
  '&:hover': {
    outline: 'solid 3px #37a',
  }
}));

const Underline = styled('u')(({ theme }) => ({
  color: '#37a',
  cursor: 'pointer',
    textDecoraton: 'underline',
  '&:hover': {
    color: 'black',
    textDecoraton: 'none',
  }
}));

function CacheMenu ({ open , anchorEl, handleClose, cache, onChoose}) {


  return (<Menu
    id="basic-menu"
    open={open}
    anchorEl={anchorEl} 
    onClose={handleClose}
    MenuListProps={{
      'aria-labelledby': 'basic-button',
    }}
  >
    {cache.map((c,i) => <MenuItem key={i} onClick={(e) =>{ 
      handleClose(e);
      onChoose && onChoose(c)  
    }}>{c}</MenuItem>)} 
  </Menu>)

}


function App() {

  const [anchorEl, setAnchorEl] = React.useState(null); 
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const [state, setState] = React.useState({
    artist: '',
    photos: [],
    cursor: 'pointer',
    cache: []
  });
  const { photos, artist, cursor, cache } = state;

  const getPhoto = React.useCallback(async (name) => {
    setState((s) => ({ ...s, cursor: 'progress', artist: name, photos: [] }));
    const photo = await setItem(name);
    setState((s) => ({ ...s, photos: photo, cursor: 'default', cache: s.cache.filter(e => e!==name).concat(name) }));
  }, []);

  const menuProps = {
    anchorEl,
    handleClose,
    open,
    cache,
    onChoose: getPhoto 
  }


  const sx = { transition: 'width 0.2s linear', m: 4, p: 2, width: photos.length ? 640 : 340, cursor }


  return (
    <div style={{ cursor, width: '100vw'}}>
      <Card elevation={6} sx={sx}>
        <Stack>
        <Stack direction="row" spacing={2}>

          <Box>
            <Typography>{!!photos.length ? `Photos for "${artist}"` : "Get Cover Art"}</Typography>
            <Typography variant="caption">
              Enter artist name and click 'Get Photos'
            </Typography>
          </Box>

          <Box sx={{flexGrow: 1}} />
          
          {!!photos.length && (<Box>
            <IconButton onClick={() => setState(s => ({...s, artist: '', photos: []}))}>
              <Close />
            </IconButton>
           </Box>)}


           {!photos.length && !!cache.length && <IconButton onClick={handleClick}>
              <MoreVert />
            </IconButton>}

           {<CacheMenu  {...menuProps}/>}

        </Stack>

          <Divider style={{ width: '100%' }} />

          <Box>
            {!!photos.map &&
              photos.map((p, i) => <a href={p.src} target="_blank"><Image  key={i} src={p.src} /></a>)}
          </Box>

          {!!photos.message && <Alert sx={{mt: 2, mb: 2 }} severity="error">
          {photos.message}. <Underline onClick={() => getPhoto(artist)}>Please try again</Underline>
          </Alert>}

          {!photos.message && <TextField
            autoFocus
            size="small"
            sx={{ mt: 2, mb: 2 , cursor}}
            value={artist}
            onKeyUp={e => e.keyCode === 13 && getPhoto(artist)}
            onChange={(e) => setState({ ...state, artist: e.target.value })}
            placeholder="Artist Name"
            label="Enter artist"
            fullWidth
          />}

          <Divider style={{ width: '100%' }} />

          <Button
          disabled={cursor === 'progress' || !artist.length}
            sx={{ mt: 2, cursor }}
            onClick={() => getPhoto(artist)}
            variant="contained"
          >
            get photos
          </Button>
        </Stack>
      </Card>
 
     {!!photos.length && (<Card sx={{...sx, overflow: 'hidden'}}>
            <Typography> JSON</Typography>
        <pre>
          {JSON.stringify(photos,0,2)}
        </pre>
      </Card>)}

    </div>
  );
}

export default App;
