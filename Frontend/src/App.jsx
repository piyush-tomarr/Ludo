import './App.css';
import Routing from './Routing/Routing';

import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Routing />

      <ToastContainer
        position="top-right"
        autoClose={1500}
hideProgressBar={true}
      />
    </>
  );
}

export default App;