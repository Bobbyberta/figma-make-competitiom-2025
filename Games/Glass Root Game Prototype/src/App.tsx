import { useState, useEffect, useCallback } from 'react'
import { StartScreen } from './components/StartScreen'
import { GameScreen } from './components/GameScreen'
import { GameOverScreen } from './components/GameOverScreen'

export type GameState = 'start' | 'playing' | 'gameOver'

export interface GameData {
  score: number
  highScore: number
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start')
  const [gameData, setGameData] = useState<GameData>({
    score: 0,
    highScore: parseInt(localStorage.getItem('glassRootHighScore') || '0')
  })

  const startGame = useCallback(() => {
    setGameState('playing')
    setGameData(prev => ({ ...prev, score: 0 }))
  }, [])

  const endGame = useCallback((finalScore: number) => {
    const newHighScore = Math.max(finalScore, gameData.highScore)
    setGameData({
      score: finalScore,
      highScore: newHighScore
    })
    localStorage.setItem('glassRootHighScore', newHighScore.toString())
    setGameState('gameOver')
  }, [gameData.highScore])

  const resetGame = useCallback(() => {
    setGameState('start')
  }, [])

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-b from-[#2F4F2F] via-[#8B4513] to-[#2E1A0F] relative">
      {gameState === 'start' && (
        <StartScreen 
          onStart={startGame} 
          highScore={gameData.highScore}
        />
      )}
      {gameState === 'playing' && (
        <GameScreen 
          onGameOver={endGame}
          onScoreUpdate={(score) => setGameData(prev => ({ ...prev, score }))}
        />
      )}
      {gameState === 'gameOver' && (
        <GameOverScreen
          score={gameData.score}
          highScore={gameData.highScore}
          onRestart={startGame}
          onBackToMenu={resetGame}
        />
      )}
    </div>
  )
}