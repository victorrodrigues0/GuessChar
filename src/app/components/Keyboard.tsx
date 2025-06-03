import React from "react"
import { ChevronDown } from "lucide-react"

interface KeyboardProps {
  keyboardRows: string[][]
  keyboardState: Record<string, string>
  handleKeyPress: (key: string) => void
  getKeyBgColor: (key: string) => string
}

const Keyboard: React.FC<KeyboardProps> = ({ keyboardRows, handleKeyPress, getKeyBgColor }) => {
  return (
    <div className="w-full max-w-xl px-4">
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 mb-1">
          {rowIndex === 2 && (
            <button
              className="bg-[#818384] hover:bg-[#565656] text-white px-4 py-3 rounded font-bold text-sm transition-colors cursor-pointer"
              onClick={() => handleKeyPress("ENTER")}
            >
              ENTER
            </button>
          )}

          {row.map((key) => (
            <button
              key={key}
              className={`w-10 h-12 flex items-center justify-center text-white font-bold rounded transition-colors cursor-pointer ${getKeyBgColor(key)}`}
              onClick={() => handleKeyPress(key)}
            >
              {key}
            </button>
          ))}

          {rowIndex === 2 && (
            <button
              className="bg-[#818384] hover:bg-[#565656] text-white px-4 py-3 rounded transition-colors cursor-pointer"
              onClick={() => handleKeyPress("BACKSPACE")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L2 12L12 22"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M2 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default Keyboard 