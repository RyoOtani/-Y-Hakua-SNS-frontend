import React from 'react';
import ReactDOM from 'react-dom/client';
import './components/bottombar/bottombar.css';
import './components/rightbar/rightbar.css';
import './components/comment/comment.css';
import './components/post/post.css';
import App from './App';
import { AuthContextProvider } from './state/AuthContext';
import { SocketContextProvider } from './state/SocketContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <SocketContextProvider>
        <App />
      </SocketContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);

//React style before React 18
// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );