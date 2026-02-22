
import './App.css'
import Bulletin from './components/Bulletin'
import Clipboard from './components/Clipboard'


function App() {


  return (
    <>
      <div className='
      min-h-screen
      flex flex-col gap-5
      border border-gray-500 
      items-center justify-center
      '
      >
        <Bulletin />
        <Clipboard/>
      </div>

    </>
  )
}

export default App
