import { useState } from 'react'
import { ReactTyped } from 'react-typed'
import './index.css'
import Form from './components/Form'

function App() {

  return (
    <>
      <div className="flex justify-center px-4">
        <h1 className="header-font text-[#9ACBD0] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mt-6 text-center">
          <ReactTyped
            strings={[
              "3D PRINTING CALCULATOR",
              "WITH A.I. CHATBOT",
              "SAVE YOUR CALCULATIONS!"
            ]}
            typeSpeed={60}
            backSpeed={40}
            loop
          />
        </h1>
      </div>
      <Form/>
    </>
  )
}

export default App