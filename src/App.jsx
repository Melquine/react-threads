import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import Header from './components/Header'
import Feed from './components/Feed'
import PopUp from './components/PopUp'
import WriteIcon from './components/WriteIcon'

const App = () => {
  const [user, setUser] = useState(null)
  const [threads, setThreads] = useState(null)
  const [viewThreadsFeed, setViewThreadsFeed] = useState(true)
  const [filteredThreads, setFilteredThreas] = useState(null)
  const [openPopUp, setOpenPopUp] = useState(false)
  const [interactingThread, setInteractingThread] = useState(null)
  const [popUpFeedThreads, setPopUpFeedThreads] = useState(null)
  const [text, setText] = useState('')

  const userId = "960c35a2-1532-455d-a3f0-ab1b7b165444"

  const getUser = async () => {
    try {

      const responsse = await fetch(`http://localhost:3000/users?user_uuid=${userId}`)
      const data = await responsse.json()
      setUser(data[0])
    
    } catch (err) {
      console.error(err)
    }
  }

  const getThreads = async () => {
    try {
      const response = await fetch(`http://localhost:3000/threads?thread_from=${userId}`)
      const data = await response.json()
      setThreads(data)

    } catch(err) {
      console.error(err)
    }
  }

  const getThreadsFeed = () => {
    if(viewThreadsFeed) {
      const standAloneThreads = threads?.filter(thread => thread.reply_to === null)
      setFilteredThreas(standAloneThreads)
    }

    if(!viewThreadsFeed) {
      const replyThreads = threads?.filter(thread => thread.reply_to !== null)
      setFilteredThreas(replyThreads)
    }
  }

  const getReplies = async() => {

    try {
      const response = await fetch(`http://localhost:3000/threads?reply_to=${interactingThread?.id}`)
      const data = await response.json()
      setPopUpFeedThreads(data)

    } catch(err) {
      console.error(err)
    }
  }

  const postThread = async () => {
    const thread = {
      "timestamp": new Date(),
      "thread_from": user.user_uuid,
      "thread_to": user.user_uuid || null,
      "reply_to": interactingThread?.id || null,
      "text": text,
      "likes": []
    }
    try {
      const response = await fetch('http://localhost:3000/threads/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(thread)
      })

      const result = await response.json()
      getThreads()
      getReplies()
      setText('')
      
    } catch (err) {
      console.error(err)
      
    }
  }

  useEffect(() => {
    getReplies()
  }, [interactingThread])

  useEffect(() => {
    getUser()
    getThreads()
  }, [])

  useEffect(() => {
    getThreadsFeed()
  }, [user, threads, viewThreadsFeed])

  const handleClick = () => {
    setPopUpFeedThreads(null)
    setInteractingThread(null)
    setOpenPopUp(true)
  }

  return (
    <>
      { user && <div className='app'>
          <Nav url={user.instagram_url}/>
          <Header
            user={user}
            viewThreadsFeed={viewThreadsFeed}
            setViewThreadsFeed={setViewThreadsFeed}
          />
          <Feed
            user={user}
            setOpenPopUp={setOpenPopUp}
            filteredThreads={filteredThreads}
            getThreads={getThreads}
            setInteractingThread={setInteractingThread}

          />
          {openPopUp &&
            <PopUp
              user={user}
              setOpenPopUp={setOpenPopUp}
              popUpFeedThreads={popUpFeedThreads}
              text={text}
              setText={setText}
              postThread={postThread}
            />}
          <div onClick={handleClick}>
            <WriteIcon />
          </div>
      </div> }
    </>
  )
}

export default App
