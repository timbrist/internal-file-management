
import { useState } from 'react'
import './App.css'
import Bulletin from './components/Bulletin'
import Clipboard from './components/Clipboard'


function App() {

  const [refreshKey, setRefreshKey] = useState<boolean>(false);

  const handleOnSent = (re:boolean)=>{ setRefreshKey(re)}
  const handleRefreshChange = (re:boolean)=>{ setRefreshKey(re)}
  return (
    <>
      <div className='
      min-h-screen
      flex flex-col gap-5
      border border-gray-500 
      items-center justify-center
      '
      >
        <Bulletin refreshKey={refreshKey} onRefreshChange={handleRefreshChange} />
        <Clipboard onSent={handleOnSent}/>
      </div>

    </>
  )
}

export default App
