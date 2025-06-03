import React, { useRef, useEffect, useState } from "react"
import { X } from "lucide-react"
import gsap from "gsap"

interface GameStats {
  gamesPlayed: number
  winPercentage: number
  currentStreak: number
  maxStreak: number
  guessDistribution: number[]
}

interface StatsModalProps {
  show: boolean
  onClose: () => void
  stats: GameStats
  onNewWord: () => void
}

const StatsModal: React.FC<StatsModalProps> = ({ show, onClose, stats, onNewWord }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(show)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (show && !visible) {
      setVisible(true)
    }
    if (!show && visible) {
      // Animação de saída
      setIsClosing(true)
      if (modalRef.current && overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
        })
        gsap.to(modalRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            setVisible(false)
            setIsClosing(false)
          },
        })
      } else {
        setVisible(false)
        setIsClosing(false)
      }
    }
  }, [show])

  // Animação de entrada só quando visible vira true
  useEffect(() => {
    if (visible && show && modalRef.current && overlayRef.current) {
      gsap.set(overlayRef.current, { opacity: 0 })
      gsap.set(modalRef.current, { opacity: 0, scale: 0.95 })
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" })
      gsap.to(modalRef.current, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" })
    }
  }, [visible, show])

  // Função para fechar com animação
  const handleClose = () => {
    setIsClosing(true)
    if (modalRef.current && overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
      })
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          setVisible(false)
          setIsClosing(false)
          onClose()
        },
      })
    } else {
      setVisible(false)
      setIsClosing(false)
      onClose()
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay animado */}
      <div ref={overlayRef} className="absolute inset-0 bg-black bg-opacity-40" />
      {/* Modal animada */}
      <div ref={modalRef} className="relative bg-[#2a2a2a] p-8 rounded-lg text-white max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Progresso</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Estatísticas principais */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.gamesPlayed}</div>
            <div className="text-sm text-gray-300">jogos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.winPercentage}%</div>
            <div className="text-sm text-gray-300">de vitórias</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
            <div className="text-sm text-gray-300">sequência</div>
            <div className="text-sm text-gray-300">de vitórias</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.maxStreak}</div>
            <div className="text-sm text-gray-300">melhor</div>
            <div className="text-sm text-gray-300">sequência</div>
          </div>
        </div>

        {/* Distribuição de tentativas */}
        <div>
          <h3 className="text-xl font-bold mb-4">distribuição de tentativas</h3>
          <div className="space-y-2">
            {stats.guessDistribution.map((count, index) => (
              <div key={index} className="flex items-center">
                <div className="w-4 text-right mr-2">{index + 1}</div>
                <div className="flex-1 bg-[#444] h-6 rounded overflow-hidden">
                  {count > 0 && (
                    <div
                      className="bg-[#3aa394] h-full flex items-center justify-end pr-2 text-sm font-bold"
                      style={{ width: `${Math.max((count / Math.max(...stats.guessDistribution)) * 100, 10)}%` }}
                    >
                      {count}
                    </div>
                  )}
                  {count === 0 && <div className="text-center text-gray-500 leading-6">0</div>}
                </div>
              </div>
            ))}
            <div className="flex items-center">
              <div className="w-4 text-right mr-2">💀</div>
              <div className="flex-1 bg-[#444] h-6 rounded overflow-hidden">
                <div className="text-center text-gray-500 leading-6">0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="mt-6 flex space-x-2">
          <button
            onClick={() => {
              onNewWord()
              handleClose()
            }}
            className="flex-1 bg-[#3aa394] text-white py-2 rounded hover:bg-[#2d8a7a] transition-colors"
          >
            Nova Palavra
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-[#666] text-white py-2 rounded hover:bg-[#555] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default StatsModal 