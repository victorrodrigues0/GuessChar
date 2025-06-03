"use client"

import { useState, useEffect } from "react"
import { Info, BarChart2, Settings, ChevronDown, HelpCircle, X, RefreshCw } from "lucide-react"
import Keyboard from "./components/Keyboard"
import StatsModal from "./components/StatsModal"

type LetterStatus = "correct" | "present" | "absent" | "empty"

interface Letter {
  letter: string
  status: LetterStatus
}

interface GameStats {
  gamesPlayed: number
  winPercentage: number
  currentStreak: number
  maxStreak: number
  guessDistribution: number[]
}

export default function TermoGame() {
  const [currentTab, setCurrentTab] = useState("termo")
  const [showHeader, setShowHeader] = useState(false)

  // Lista de palavras possíveis
  const wordList = [
    "NAVES",
    "CARRO",
    "LIVRO",
    "PEDRA",
    "FLORE",
    "MUNDO",
    "TEMPO",
    "LUGAR",
    "GENTE",
    "COISA",
    "PARTE",
    "FORMA",
    "GRUPO",
    "PONTO",
    "TERRA",
    "CAMPO",
    "FUNDO",
    "ORDEM",
    "VALOR",
    "PODER",
    "PAPEL",
    "LINHA",
    "CORPO",
    "VISTA",
    "NOITE",
    "MORTE",
    "FESTA",
    "PRETO",
    "BRAVO",
    "VERDE",
    "AZUIS",
    "DOCES",
    "FORTE",
    "LARGO",
    "BAIXO",
    "CERTO",
    "LIVRE",
    "FELIZ",
    "TRISTE",
    "CALMO",
    "RAPIDO",
    "LENTO",
    "QUENTE",
    "FRIOS",
    "LIMPO",
    "SUJOS",
    "NOVOS",
    "VELHA",
    "BELOS",
    "FEIOS",
  ]

  // Função para gerar palavra do dia baseada na data
  const getDailyWord = () => {
    const today = new Date()
    const dateString = today.toDateString()

    // Usar a data como seed para sempre ter a mesma palavra no mesmo dia
    let hash = 0
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }

    const index = Math.abs(hash) % wordList.length
    return wordList[index]
  }

  // Palavra do dia
  const [targetWord, setTargetWord] = useState(getDailyWord())

  // Estado do jogo
  const [currentRow, setCurrentRow] = useState(0)
  const [currentCol, setCurrentCol] = useState(0)
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing")
  const [showStatsModal, setShowStatsModal] = useState(false)

  // Animações
  const [revealingRow, setRevealingRow] = useState(-1)
  const [revealingCol, setRevealingCol] = useState(-1)

  // Estatísticas do jogo
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 16,
    winPercentage: 100,
    currentStreak: 1,
    maxStreak: 3,
    guessDistribution: [0, 0, 5, 5, 3, 3],
  })

  // Grid do jogo - 6 tentativas de 5 letras cada
  const [grid, setGrid] = useState<Letter[][]>(
    Array(6)
      .fill(null)
      .map(() =>
        Array(5)
          .fill(null)
          .map(() => ({ letter: "", status: "empty" as LetterStatus })),
      ),
  )

  // Estado das teclas do teclado
  const [keyboardState, setKeyboardState] = useState<Record<string, LetterStatus>>({})

  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ]

  // Função para gerar nova palavra aleatória
  const generateRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * wordList.length)
    const newWord = wordList[randomIndex]
    setTargetWord(newWord)
    resetGame()
  }

  // Função para resetar o jogo
  const resetGame = () => {
    setCurrentRow(0)
    setCurrentCol(0)
    setGameState("playing")
    setGrid(
      Array(6)
        .fill(null)
        .map(() =>
          Array(5)
            .fill(null)
            .map(() => ({ letter: "", status: "empty" as LetterStatus })),
        ),
    )
    setKeyboardState({})
    setRevealingRow(-1)
    setRevealingCol(-1)
  }

  // Função para verificar a palavra com animação
  const checkWord = async () => {
    const currentWord = grid[currentRow].map((cell) => cell.letter).join("")

    if (currentWord.length !== 5) return

    const newGrid = [...grid]
    const newKeyboardState = { ...keyboardState }

    // Criar arrays para rastrear letras
    const targetLetters = targetWord.split("")
    const resultStatuses: LetterStatus[] = new Array(5).fill("absent")

    // Primeira passada: marcar letras corretas (verde)
    for (let i = 0; i < 5; i++) {
      if (currentWord[i] === targetLetters[i]) {
        resultStatuses[i] = "correct"
        targetLetters[i] = "" // Remover da lista para não contar novamente
      }
    }

    // Segunda passada: marcar letras presentes mas na posição errada (amarelo)
    for (let i = 0; i < 5; i++) {
      if (resultStatuses[i] === "absent") {
        const letterIndex = targetLetters.indexOf(currentWord[i])
        if (letterIndex !== -1) {
          resultStatuses[i] = "present"
          targetLetters[letterIndex] = "" // Remover da lista
        }
      }
    }

    // Animar revelação das letras
    setRevealingRow(currentRow)
    for (let i = 0; i < 5; i++) {
      setRevealingCol(i)
      await new Promise((resolve) => setTimeout(resolve, 200))

      newGrid[currentRow][i] = {
        letter: currentWord[i],
        status: resultStatuses[i],
      }

      // Atualizar estado do teclado
      const currentKeyStatus = newKeyboardState[currentWord[i]]
      if (
        !currentKeyStatus ||
        (currentKeyStatus === "absent" && resultStatuses[i] !== "absent") ||
        (currentKeyStatus === "present" && resultStatuses[i] === "correct")
      ) {
        newKeyboardState[currentWord[i]] = resultStatuses[i]
      }

      setGrid([...newGrid])
      setKeyboardState({ ...newKeyboardState })
    }

    setRevealingRow(-1)
    setRevealingCol(-1)

    // Verificar se ganhou
    if (currentWord === targetWord) {
      setGameState("won")
      setTimeout(() => setShowStatsModal(true), 1000)
      return
    }

    // Verificar se perdeu (última tentativa)
    if (currentRow === 5) {
      setGameState("lost")
      setTimeout(() => setShowStatsModal(true), 1000)
      return
    }

    // Próxima linha
    setCurrentRow(currentRow + 1)
    setCurrentCol(0)
  }

  // Função para adicionar letra
  const addLetter = (letter: string) => {
    if (gameState !== "playing" || currentCol >= 5) return

    const newGrid = [...grid]
    newGrid[currentRow][currentCol] = { letter, status: "empty" }
    setGrid(newGrid)
    setCurrentCol(currentCol + 1)
  }

  // Função para remover letra
  const removeLetter = () => {
    if (gameState !== "playing") return

    const newGrid = [...grid]
    // Se a célula atual tem letra, apaga ela
    if (grid[currentRow][currentCol]?.letter) {
      newGrid[currentRow][currentCol] = { letter: "", status: "empty" }
      setGrid(newGrid)
    } else if (currentCol > 0) {
      // Se não tem letra, volta o cursor e apaga a anterior
      newGrid[currentRow][currentCol - 1] = { letter: "", status: "empty" }
      setGrid(newGrid)
      setCurrentCol(currentCol - 1)
    }
  }

  // Função para processar entrada do teclado
  const handleKeyPress = (key: string) => {
    if (key === "ENTER") {
      // Permite ENTER se todos os quadrados da linha atual estiverem preenchidos
      const isRowFull = grid[currentRow].every(cell => cell.letter !== "")
      if (isRowFull) {
        checkWord()
      }
    } else if (key === "BACKSPACE") {
      removeLetter()
    } else if (key === "ARROWLEFT") {
      if (currentCol > 0 && gameState === 'playing') setCurrentCol(currentCol - 1)
    } else if (key === "ARROWRIGHT") {
      if (currentCol < 4 && gameState === 'playing') setCurrentCol(currentCol + 1)
    } else if (key.match(/^[A-Z]$/)) {
      addLetter(key)
    }
  }

  // Event listener para teclado físico
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase()

      if (key === "ENTER") {
        handleKeyPress("ENTER")
      } else if (key === "BACKSPACE") {
        handleKeyPress("BACKSPACE")
      } else if (key === "ARROWLEFT") {
        if (currentCol > 0 && gameState === 'playing') setCurrentCol(currentCol - 1)
      } else if (key === "ARROWRIGHT") {
        if (currentCol < 4 && gameState === 'playing') setCurrentCol(currentCol + 1)
      } else if (key.match(/^[A-Z]$/)) {
        handleKeyPress(key)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentRow, currentCol, gameState])

  const getLetterBgColor = (status: LetterStatus, rowIndex: number, colIndex: number) => {
    const isRevealing = revealingRow === rowIndex && revealingCol >= colIndex
    const shouldAnimate = revealingRow === rowIndex && revealingCol === colIndex

    switch (status) {
      case "correct":
        return `bg-[#3aa394] ${shouldAnimate ? "animate-flip" : ""}`
      case "present":
        return `bg-[#d3ad69] ${shouldAnimate ? "animate-flip" : ""}`
      case "absent":
        return `bg-[#312a2b] ${shouldAnimate ? "animate-flip" : ""}`
      default:
        return "bg-[#4a4041] border-2 border-[#565656]"
    }
  }

  const getKeyBgColor = (key: string) => {
    const status = keyboardState[key]
    switch (status) {
      case "correct":
        return "bg-[#3aa394]"
      case "present":
        return "bg-[#d3ad69]"
      case "absent":
        return "bg-[#312a2b]"
      default:
        return "bg-[#818384] hover:bg-[#565656]"
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#6e5f60] overflow-y-auto">
      {/* Botão para controlar o header no canto superior esquerdo, que desce ao clicar */}
      <button
        className={`fixed left-4 z-50 bg-[#444] text-white p-2 rounded shadow transition-all duration-500 cursor-pointer ${showHeader ? 'top-20' : 'top-4'}`}
        onClick={() => setShowHeader(!showHeader)}
        aria-label={showHeader ? "Esconder menu" : "Mostrar menu"}
      >
        <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${showHeader ? 'rotate-180' : ''}`} />
      </button>

      {/* Botão de interrogação abaixo da seta */}
      <button
        className={`fixed left-4 z-50 bg-[#444] text-white p-2 rounded shadow transition-all duration-500 cursor-pointer ${showHeader ? 'top-32' : 'top-16'}`}
        aria-label="Ajuda"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Botão de estatísticas no canto superior direito */}
      <button
        className={`fixed right-4 z-50 bg-[#444] text-white p-2 rounded shadow transition-all duration-500 cursor-pointer ${showHeader ? 'top-20' : 'top-4'}`}
        aria-label="Estatísticas"
        onClick={() => setShowStatsModal(true)}
      >
        <BarChart2 className="w-6 h-6" />
      </button>

      {/* Botão de resetar palavra abaixo do botão de estatísticas */}
      <button
        className={`fixed right-4 z-50 bg-[#444] text-white p-2 rounded shadow transition-all duration-500 cursor-pointer ${showHeader ? 'top-32' : 'top-16'}`}
        aria-label="Resetar Palavra"
        onClick={generateRandomWord}
      >
        <RefreshCw className="w-6 h-6" />
      </button>

      {/* Header animado */}
      <div
        className={`w-full fixed left-0 z-40 transition-all duration-500 ${showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        style={{ top: 0 }}
      >
        <header className="bg-[#1a1a1a] text-white p-4 px-20 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <button
              className={`text-lg ${currentTab === "solo" ? "font-bold" : "text-gray-400"}`}
              onClick={() => setCurrentTab("solo")}
            >
              solo
            </button>
            <button
              className={`text-lg ${currentTab === "dueto" ? "font-bold" : "text-gray-400"}`}
              onClick={() => setCurrentTab("dueto")}
            >
              dueto
            </button>
            <button
              className={`text-lg ${currentTab === "quarteto" ? "font-bold" : "text-gray-400"}`}
              onClick={() => setCurrentTab("quarteto")}
            >
              quarteto
            </button>
          </div>
        </header>
      </div>

      {/* Game Area */}
      <div className={`flex-1 flex flex-col items-center justify-between py-4 transition-all duration-500 ${showHeader ? 'mt-20' : ''}`}>
        {/* Top Controls removidos conforme solicitado */}

        {/* Título centralizado acima do grid */}
        <h1 className="text-white text-3xl font-bold mb-6 text-center">GuessChar</h1>

        {/* Game Grid */}
        <div className="grid grid-rows-6 gap-1 mb-8">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-16 h-16 flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 cursor-pointer ${getLetterBgColor(cell.status, rowIndex, colIndex)} ${(rowIndex === currentRow && colIndex === currentCol && gameState !== 'won') ? 'ring-2 ring-yellow-400' : ''}`}
                  onClick={() => {
                    if (rowIndex === currentRow && gameState === 'playing') setCurrentCol(colIndex)
                  }}
                >
                  {cell.letter}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Keyboard */}
        <Keyboard
          keyboardRows={keyboardRows}
          keyboardState={keyboardState}
          handleKeyPress={handleKeyPress}
          getKeyBgColor={getKeyBgColor}
        />
      </div>

      {/* Modal de Estatísticas */}
      <StatsModal
        show={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        stats={stats}
        onNewWord={generateRandomWord}
      />
    </div>
  )
}
