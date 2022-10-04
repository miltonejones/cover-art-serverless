import React from 'react'; 
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
const blogpoint = "https://6as41g1bz3.execute-api.us-east-1.amazonaws.com/"



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
    


const getBlogPost = async (address) => {
  // build request options
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  };

  // send POST request
  const response = await fetch(blogpoint, requestOptions);
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


const BlogPostInfo = ({properties}) => {

  if (!properties) return <i />
  const image = properties.find(p =>  p.name === 'og:image');
  const title = properties.find(p =>  p.name === 'og:title');
  const description = properties.find(p =>  p.name === 'description');
  const site_name = properties.find(p =>  p.name === 'og:site_name');
  const author = properties.find(p =>  p.name === 'twitter:data1');
 
  return (<Stack>
      <Stack direction="row" spacing={2}>
        {!!image && <img style={{width: 160, height: 90}} src={image.content} alt="blog" />}
        <Stack>
         {!!title &&  <Typography variant="h6">{title.content}</Typography>}
          {!!description && <Typography variant="subitle1">{description.content}</Typography>}
        </Stack>
      </Stack>
      <Stack direction="row" spacing={2}>
        {!!site_name && <Stack>
          <Typography variant="body2">Site Name</Typography>
          <Typography variant="caption">{site_name.content}</Typography>
        </Stack>}
          <Box sx={{flexGrow: 1}} />
        {!!author && <Stack>
          <Typography variant="body2">Author</Typography>
          <Typography variant="caption">{author.content}</Typography>
        </Stack>}
          
      </Stack>
    </Stack>)
}

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
    address: 'https://www.lifehack.org/articles/communication/30-books-that-everyone-should-read-least-once-their-lives.html',
    properties: [],
    photos: [],
    cursor: 'pointer',
    cache: []
  });
  const { photos, artist, cursor, cache, address, properties } = state;

  const getPhoto = React.useCallback(async (name) => {
    setState((s) => ({ ...s, cursor: 'progress', artist: name, photos: [] }));
    const photo = await setItem(name);
    setState((s) => ({ ...s, photos: photo, cursor: 'default', cache: s.cache.filter(e => e!==name).concat(name) }));
  }, []);

  const getPost = React.useCallback(async (address) => {
    setState((s) => ({ ...s, cursor: 'progress',  properties: [] }));
    const props = await getBlogPost(address);
    setState((s) => ({ ...s, properties: props, cursor: 'default'  }));
  }, []);

  const menuProps = {
    anchorEl,
    handleClose,
    open,
    cache,
    onChoose: getPhoto 
  }


  const sx = { transition: 'width 0.2s linear', m: 4, p: 2, width: photos.length || properties.length ? 640 : 340, cursor }


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
              photos.map((p, i) => <a href={p.src}  rel="noreferrer"target="_blank"><Image  key={i} src={p.src} /></a>)}
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


      <Card elevation={6} sx={sx}>
      <Stack direction="row" spacing={2}>

        <Box>
          <Typography>Get Site Metadata</Typography>
          <Typography variant="caption">
            Enter Site URL and press 'Enter'
          </Typography>
        </Box>

        <Box sx={{flexGrow: 1}} />

        {!!properties.length && (<Box>
          <IconButton onClick={() => setState(s => ({...s, properties: []}))}>
            <Close />
          </IconButton>
        </Box>)}

 

        </Stack>

        <Divider style={{ width: '100%' }} />
       
       <Box sx={{mt: 2}}>
       <BlogPostInfo properties={properties} />
        <TextField 
            autoFocus
            size="small"
            sx={{ mt: 2, mb: 2 , cursor}}
            onKeyUp={e => e.keyCode === 13 && getPost(address)}
            onChange={(e) => setState({ ...state, address: e.target.value })}
            placeholder="Site URL"
            label="Enter web address"
            fullWidth
            value={address}/>

      <pre>
          {JSON.stringify(properties,0,2)}
        </pre>
       </Box>
         
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
