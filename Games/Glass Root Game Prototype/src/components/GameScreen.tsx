import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'motion/react'

interface GameScreenProps {
  onGameOver: (score: number) => void
  onScoreUpdate: (score: number) => void
}

interface Position {
  x: number
  y: number
}

interface Obstacle {
  id: string
  x: number
  y: number
  width: number
  height: number
  type: 'glass' | 'rock'
}

interface PowerUp {
  id: string
  x: number
  y: number
  type: 'shield' | 'nutrient' | 'destroyer'
}

interface PowerUpHeadsUp {
  id: string
  x: number
  type: 'shield' | 'nutrient' | 'destroyer'
  timeLeft: number
}

interface ObstacleWarning {
  id: string
  x: number
  width: number
  type: 'glass' | 'rock'
  timeLeft: number
}

interface RootSegment {
  x: number
  y: number
}

export function GameScreen({ onGameOver, onScoreUpdate }: GameScreenProps) {
  const gameRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const gameStateRef = useRef({ obstacles: [], powerUps: [], hasShield: false, score: 0 })
  
  // Game state
  const [gameRunning, setGameRunning] = useState(true)
  const [gamePaused, setGamePaused] = useState(false)
  const [collisionAnimating, setCollisionAnimating] = useState(false)
  const [collisionData, setCollisionData] = useState<{ x: number, y: number, type: 'glass' | 'rock' } | null>(null)
  const [score, setScore] = useState(0)
  const [speed, setSpeed] = useState(2)
  
  // Player state - root stays at fixed Y position (40% down screen)
  const [rootPath, setRootPath] = useState<RootSegment[]>([{ x: 50, y: 40 }])
  const [currentDirection, setCurrentDirection] = useState(0) // -1 left, 0 center, 1 right
  const [hasShield, setHasShield] = useState(false)
  const [shieldTimeLeft, setShieldTimeLeft] = useState(0)
  const [nutrientMeter, setNutrientMeter] = useState(0)
  const [slowMotionActive, setSlowMotionActive] = useState(false)
  const [slowMotionTimeLeft, setSlowMotionTimeLeft] = useState(0)
  const [destroyerActive, setDestroyerActive] = useState(false)
  const [destroyerTimeLeft, setDestroyerTimeLeft] = useState(0)
  
  // Game objects
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [powerUps, setPowerUps] = useState<PowerUp[]>([])
  const [powerUpHeadsUp, setPowerUpHeadsUp] = useState<PowerUpHeadsUp[]>([])
  const [obstacleWarnings, setObstacleWarnings] = useState<ObstacleWarning[]>([])
  const [lastWideObstacleY, setLastWideObstacleY] = useState<number>(-100) // Track last wide obstacle position
  
  const [touchActive, setTouchActive] = useState(false)
  const [touchSide, setTouchSide] = useState<'left' | 'right' | null>(null)

  // Update refs when state changes to avoid stale closures
  useEffect(() => {
    gameStateRef.current = { obstacles, powerUps, hasShield, score }
  }, [obstacles, powerUps, hasShield, score])

  // Check if position conflicts with existing power-ups (for obstacle avoidance)
  const conflictsWithPowerUps = useCallback((x: number, width: number) => {
    return powerUps.some(powerUp => {
      const powerUpLeft = powerUp.x - 8 // Power-up safety zone
      const powerUpRight = powerUp.x + 8
      const obstacleLeft = x
      const obstacleRight = x + width
      
      return !(obstacleRight < powerUpLeft || obstacleLeft > powerUpRight)
    })
  }, [powerUps])

  // Check if power-up position conflicts with existing obstacles
  const powerUpConflictsWithObstacles = useCallback((powerUpX: number, powerUpY: number) => {
    return obstacles.some(obstacle => {
      // Calculate safety zone around obstacle (larger for power-ups to ensure clear navigation)
      const safetyMargin = 12 // 12% screen width safety zone around obstacles
      const verticalMargin = 15 // 15% screen height safety zone
      
      const obstacleLeft = obstacle.x - safetyMargin
      const obstacleRight = obstacle.x + obstacle.width + safetyMargin
      const obstacleTop = obstacle.y - verticalMargin
      const obstacleBottom = obstacle.y + obstacle.height + verticalMargin
      
      // Power-up size (8% width/height as it's displayed as 8x8 in collision)
      const powerUpLeft = powerUpX - 4
      const powerUpRight = powerUpX + 4
      const powerUpTop = powerUpY - 4
      const powerUpBottom = powerUpY + 4
      
      // Check if power-up overlaps with obstacle's safety zone
      const horizontalOverlap = !(powerUpRight < obstacleLeft || powerUpLeft > obstacleRight)
      const verticalOverlap = !(powerUpBottom < obstacleTop || powerUpTop > obstacleBottom)
      
      return horizontalOverlap && verticalOverlap
    })
  }, [obstacles])

  // Check if new obstacle has reasonable spacing from existing obstacles
  const conflictsWithObstacles = useCallback((newObstacle: { x: number, y: number, width: number, height: number }) => {
    return obstacles.some(existingObstacle => {
      // Calculate minimum required spacing based on obstacle sizes
      const verticalGap = Math.max(8, (newObstacle.height + existingObstacle.height) / 2 + 5)
      const horizontalGap = Math.max(10, (newObstacle.width + existingObstacle.width) / 4 + 3)
      
      // Check vertical spacing
      const verticalDistance = Math.abs(newObstacle.y - existingObstacle.y)
      const tooCloseVertically = verticalDistance < verticalGap
      
      if (!tooCloseVertically) return false
      
      // If they're close vertically, check horizontal spacing
      const newLeft = newObstacle.x - horizontalGap / 2
      const newRight = newObstacle.x + newObstacle.width + horizontalGap / 2
      const existingLeft = existingObstacle.x - horizontalGap / 2
      const existingRight = existingObstacle.x + existingObstacle.width + horizontalGap / 2
      
      // Return true if there's insufficient horizontal gap
      return !(newRight < existingLeft || newLeft > existingRight)
    })
  }, [obstacles])

  // Pause/Resume functions
  const handlePause = useCallback(() => {
    setGamePaused(true)
  }, [])

  const handleResume = useCallback(() => {
    setGamePaused(false)
    lastTimeRef.current = performance.now() // Reset timer to avoid large delta
  }, [])

  // Generate obstacles - they start below the screen and move up
  const generateObstacle = useCallback((yPosition: number): Obstacle | null => {
    const types: ('glass' | 'rock')[] = score > 1000 ? ['glass', 'rock'] : ['glass']
    const type = types[Math.floor(Math.random() * types.length)]
    
    // Calculate scaling factor based on score - starts at 0.5x, reaches 1x at 500m, 1.5x at 1500m, caps at 2x
    const baseScale = 0.5
    const maxScale = 2.0
    const scoreForFullScale = 500
    const scoreForMaxScale = 1500
    
    let scaleFactor = baseScale
    if (score <= scoreForFullScale) {
      scaleFactor = baseScale + (0.5 * (score / scoreForFullScale))
    } else if (score <= scoreForMaxScale) {
      scaleFactor = 1.0 + (1.0 * ((score - scoreForFullScale) / (scoreForMaxScale - scoreForFullScale)))
    } else {
      scaleFactor = maxScale
    }
    
    let obstacle: Obstacle
    let attempts = 0
    const maxAttempts = 20 // Increased attempts to find good positions
    
    do {
      attempts++
      
      if (type === 'glass') {
        // Glass shard patterns - base sizes that get scaled
        const basePatterns = [
          // Single shard
          { width: 8, height: 8 },
          // Small cluster  
          { width: 15, height: 12 },
          // Diagonal line
          { width: 30, height: 6 },
        ]
        const basePattern = basePatterns[Math.floor(Math.random() * basePatterns.length)]
        
        // Apply scaling to the pattern
        const scaledWidth = Math.round(basePattern.width * scaleFactor)
        const scaledHeight = Math.round(basePattern.height * scaleFactor)
        
        obstacle = {
          id: Math.random().toString(),
          x: Math.random() * (100 - scaledWidth),
          y: yPosition,
          width: scaledWidth,
          height: scaledHeight,
          type: 'glass'
        }
      } else {
        // Rock formation - base sizes that get scaled
        const baseWidth = 20
        const baseHeight = 25
        
        const scaledWidth = Math.round(baseWidth * scaleFactor)
        const scaledHeight = Math.round(baseHeight * scaleFactor)
        
        // Ensure rock doesn't get too wide for screen positioning
        const maxRockWidth = Math.min(scaledWidth, 40)
        const xRange = 100 - maxRockWidth - 30 // Leave margins
        
        obstacle = {
          id: Math.random().toString(),
          x: Math.random() * xRange + 15,
          y: yPosition,
          width: maxRockWidth,
          height: scaledHeight,
          type: 'rock'
        }
      }
      
      // Check for wide obstacle spacing - ensure adequate distance between wide obstacles
      const isWideObstacle = obstacle.width > 25
      const minSpacing = 40 // Minimum 40% screen height between wide obstacles
      
      if (isWideObstacle && (yPosition - lastWideObstacleY) < minSpacing) {
        // Force this to be a smaller obstacle instead
        if (type === 'glass') {
          obstacle.width = Math.min(obstacle.width, 20) // Cap at 20% width
        } else {
          obstacle.width = Math.min(obstacle.width, 18) // Cap rocks at 18% width
        }
      }
      
      // Check if this obstacle conflicts with power-ups
      const powerUpConflict = conflictsWithPowerUps(obstacle.x, obstacle.width)
      
      // Check obstacle conflicts with relaxed spacing for later attempts
      const useRelaxedSpacing = attempts > maxAttempts / 2
      let obstacleConflict = false
      
      if (useRelaxedSpacing) {
        // Relaxed spacing: just check for direct overlaps
        obstacleConflict = obstacles.some(existingObstacle => {
          const verticalOverlap = Math.abs(obstacle.y - existingObstacle.y) < (obstacle.height + existingObstacle.height) / 2 + 3
          if (!verticalOverlap) return false
          
          const newLeft = obstacle.x
          const newRight = obstacle.x + obstacle.width
          const existingLeft = existingObstacle.x
          const existingRight = existingObstacle.x + existingObstacle.width
          
          return !(newRight < existingLeft || newLeft > existingRight)
        })
      } else {
        // Normal spacing requirements
        obstacleConflict = conflictsWithObstacles(obstacle)
      }
      
      if (!powerUpConflict && !obstacleConflict) {
        return obstacle
      }
    } while (attempts < maxAttempts)
    
    // If we can't place an obstacle without conflicts, don't place one
    return null
  }, [score, conflictsWithPowerUps, conflictsWithObstacles, lastWideObstacleY])

  // Generate power-ups - they start below the screen and move up
  const generatePowerUp = useCallback((yPosition: number): PowerUp | null => {
    if (Math.random() < 0.5) { // 50% chance - increased from 30%
      const rand = Math.random()
      const type = rand < 0.5 ? 'nutrient' : rand < 0.8 ? 'shield' : 'destroyer'
      
      // Try to find a safe position for the power-up
      let attempts = 0
      const maxAttempts = 15
      
      do {
        attempts++
        const x = Math.random() * 90 + 5 // 5% margin on each side
        
        // Check if this position conflicts with obstacles
        const hasObstacleConflict = powerUpConflictsWithObstacles(x, yPosition)
        
        if (!hasObstacleConflict) {
          return {
            id: Math.random().toString(),
            x,
            y: yPosition,
            type
          }
        }
      } while (attempts < maxAttempts)
    }
    
    // If we couldn't find a safe position or random chance failed, don't spawn power-up
    return null
  }, [powerUpConflictsWithObstacles])

  // Collision detection
  const checkCollision = useCallback((rootX: number, rootY: number, obj: { x: number, y: number, width: number, height: number }) => {
    const rootSize = 3
    return (
      rootX < obj.x + obj.width &&
      rootX + rootSize > obj.x &&
      rootY < obj.y + obj.height &&
      rootY + rootSize > obj.y
    )
  }, [])

  // Handle touch/mouse controls
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!gameRunning || gamePaused || collisionAnimating) return
    
    const rect = gameRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const isLeftSide = x < rect.width / 2
    
    setTouchActive(true)
    setTouchSide(isLeftSide ? 'left' : 'right')
    setCurrentDirection(isLeftSide ? -1 : 1)
  }, [gameRunning])

  const handlePointerUp = useCallback(() => {
    setTouchActive(false)
    setTouchSide(null)
    setCurrentDirection(0)
  }, [])

  // Keyboard controls for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameRunning || gamePaused || collisionAnimating) return
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setCurrentDirection(-1)
        setTouchActive(true)
        setTouchSide('left')
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setCurrentDirection(1)
        setTouchActive(true)
        setTouchSide('right')
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || 
          e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setCurrentDirection(0)
        setTouchActive(false)
        setTouchSide(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameRunning, gamePaused])

  // Handle collision animation completion
  useEffect(() => {
    if (collisionAnimating) {
      const timer = setTimeout(() => {
        onGameOver(score)
      }, 2000) // 2 second collision animation
      
      return () => clearTimeout(timer)
    }
  }, [collisionAnimating, score, onGameOver])

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if ((!gameRunning && !collisionAnimating) || gamePaused) {
      animationRef.current = requestAnimationFrame(gameLoop)
      return
    }
    
    const deltaTime = currentTime - lastTimeRef.current
    lastTimeRef.current = currentTime
    
    if (deltaTime < 16) { // Cap at ~60fps
      animationRef.current = requestAnimationFrame(gameLoop)
      return
    }

    const gameSpeed = (slowMotionActive || collisionAnimating) ? speed * 0.3 : speed
    
    // Update root position - root stays at fixed Y, only X moves
    setRootPath(prev => {
      const lastSegment = prev[prev.length - 1]
      const newX = Math.max(2, Math.min(98, lastSegment.x + currentDirection * 1.5))
      const fixedY = 40 // Keep root at 40% down the screen
      
      const newPath = [...prev, { x: newX, y: fixedY }]
      
      // Check collisions with the new root position (only if game is still running and not animating collision)
      if (gameRunning && !collisionAnimating) {
        const currentRoot = { x: newX, y: fixedY }
        const currentState = gameStateRef.current
        
        // Check obstacle collisions
        currentState.obstacles.forEach(obstacle => {
          if (checkCollision(currentRoot.x, currentRoot.y, obstacle)) {
            // If destroyer mode is active, destroy the obstacle
            if (destroyerActive) {
              setObstacles(prevObs => prevObs.filter(obs => obs.id !== obstacle.id))
              return prev // Continue without collision damage
            }
            
            if (obstacle.type === 'glass') {
              if (currentState.hasShield) {
                // Bounce off with shield
                setHasShield(false)
                setShieldTimeLeft(0)
                // Remove the obstacle that was hit
                setObstacles(prevObs => prevObs.filter(obs => obs.id !== obstacle.id))
              } else {
                // Start collision animation
                setCollisionAnimating(true)
                setCollisionData({ x: currentRoot.x, y: currentRoot.y, type: 'glass' })
                setGameRunning(false)
                return prev // Return previous path to avoid further updates
              }
            } else if (obstacle.type === 'rock') {
              // Rock is impassable - start collision animation
              setCollisionAnimating(true)
              setCollisionData({ x: currentRoot.x, y: currentRoot.y, type: 'rock' })
              setGameRunning(false)
              return prev // Return previous path to avoid further updates
            }
          }
        })
        
        // Check power-up collisions (larger hitbox)
        currentState.powerUps.forEach(powerUp => {
          if (checkCollision(currentRoot.x, currentRoot.y, { ...powerUp, width: 8, height: 8 })) {
            if (powerUp.type === 'shield') {
              setHasShield(true)
              setShieldTimeLeft(8000) // 8 seconds - increased from 5
            } else if (powerUp.type === 'nutrient') {
              setNutrientMeter(prev => {
                const newMeter = Math.min(100, prev + 35) // Increased from 25 to 35
                if (newMeter >= 100) {
                  setSlowMotionActive(true)
                  setSlowMotionTimeLeft(5000) // 5 seconds - increased from 3
                  return 0
                }
                return newMeter
              })
            } else if (powerUp.type === 'destroyer') {
              setDestroyerActive(true)
              setDestroyerTimeLeft(6000) // 6 seconds
            }
            
            // Remove collected power-up
            setPowerUps(prevPowerUps => prevPowerUps.filter(pu => pu.id !== powerUp.id))
          }
        })
      }
      
      // Keep only recent segments and ensure they trail upward from the root tip
      const trailSegments = newPath.slice(-20).map((segment, index, array) => ({
        x: segment.x,
        y: fixedY - (array.length - 1 - index) * 2 // Trail upward from root tip
      }))
      
      return trailSegments
    })
    
    // Update score
    setScore(prev => {
      const newScore = prev + Math.floor(gameSpeed)
      onScoreUpdate(newScore)
      return newScore
    })
    
    // Increase speed gradually
    setSpeed(prev => Math.min(6, prev + 0.001))
    
    // Update timers
    if (shieldTimeLeft > 0) {
      setShieldTimeLeft(prev => Math.max(0, prev - deltaTime))
      if (shieldTimeLeft <= deltaTime) {
        setHasShield(false)
      }
    }
    
    if (slowMotionTimeLeft > 0) {
      setSlowMotionTimeLeft(prev => Math.max(0, prev - deltaTime))
      if (slowMotionTimeLeft <= deltaTime) {
        setSlowMotionActive(false)
      }
    }
    
    if (destroyerTimeLeft > 0) {
      setDestroyerTimeLeft(prev => Math.max(0, prev - deltaTime))
      if (destroyerTimeLeft <= deltaTime) {
        setDestroyerActive(false)
      }
    }
    
    // Generate new obstacles - they move up from below toward the root (only when game is running)
    if (gameRunning && !collisionAnimating) {
      setObstacles(prev => {
        const newObstacles = prev.filter(obs => obs.y > -20) // Remove off-screen obstacles at top
        
        // Update last wide obstacle Y position as obstacles move up
        setLastWideObstacleY(prevY => prevY - gameSpeed)
        
        // Add new obstacles from below - adjusted spawn rate to account for stricter spacing
        if (Math.random() < 0.025 * gameSpeed) { // Slightly increased spawn rate since some attempts will fail
          const newObstacle = generateObstacle(120)
          if (newObstacle) {
            newObstacles.push(newObstacle)
            
            // Update last wide obstacle position and add warning for wide obstacles
            if (newObstacle.width > 25) {
              setLastWideObstacleY(120) // Update the position tracker
              setObstacleWarnings(prevWarnings => [
                ...prevWarnings,
                {
                  id: newObstacle.id,
                  x: newObstacle.x,
                  width: newObstacle.width,
                  type: newObstacle.type,
                  timeLeft: 3500 // 3.5 seconds warning
                }
              ])
            }
          }
        }
        
        return newObstacles.map(obs => ({ ...obs, y: obs.y - gameSpeed }))
      })
    } else if (collisionAnimating) {
      // Continue moving existing obstacles during collision animation
      setObstacles(prev => prev.map(obs => ({ ...obs, y: obs.y - gameSpeed })))
    }
    
    // Generate new power-ups - they move up from below toward the root (only when game is running)
    if (gameRunning && !collisionAnimating) {
      setPowerUps(prev => {
        const newPowerUps = prev.filter(pu => pu.y > -20)
        
        if (Math.random() < 0.02 * gameSpeed) { // Doubled spawn frequency
          const newPowerUp = generatePowerUp(120)
          if (newPowerUp) {
            newPowerUps.push(newPowerUp)
            
            // Add heads-up display for this power-up
            setPowerUpHeadsUp(prevHeadsUp => [
              ...prevHeadsUp,
              {
                id: newPowerUp.id,
                x: newPowerUp.x,
                type: newPowerUp.type,
                timeLeft: 4000 // 4 seconds warning - increased from 3
              }
            ])
          }
        }
        
        return newPowerUps.map(pu => ({ ...pu, y: pu.y - gameSpeed }))
      })
    } else if (collisionAnimating) {
      // Continue moving existing power-ups during collision animation
      setPowerUps(prev => prev.map(pu => ({ ...pu, y: pu.y - gameSpeed })))
    }
    
    // Update heads-up display
    setPowerUpHeadsUp(prev => {
      return prev
        .map(headsUp => ({ ...headsUp, timeLeft: headsUp.timeLeft - deltaTime }))
        .filter(headsUp => headsUp.timeLeft > 0)
    })
    
    // Update obstacle warnings
    setObstacleWarnings(prev => {
      return prev
        .map(warning => ({ ...warning, timeLeft: warning.timeLeft - deltaTime }))
        .filter(warning => warning.timeLeft > 0)
    })
    
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [gameRunning, gamePaused, currentDirection, speed, slowMotionActive, shieldTimeLeft, slowMotionTimeLeft, destroyerActive, destroyerTimeLeft, checkCollision, generateObstacle, generatePowerUp, conflictsWithPowerUps, powerUpConflictsWithObstacles, onScoreUpdate, onGameOver])



  // Start game loop
  useEffect(() => {
    if (gameRunning) {
      animationRef.current = requestAnimationFrame(gameLoop)
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameLoop, gameRunning])

  if (!gameRunning && !collisionAnimating) return null

  return (
    <div 
      ref={gameRef}
      className="absolute inset-0 overflow-hidden select-none game-container"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      {/* Pause/Resume Overlay */}
      {gamePaused && (
        <motion.div 
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ 
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)' 
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="text-[#F4E4BC] text-4xl md:text-6xl mb-8 tracking-wider"
                 style={{ textShadow: '0 0 20px rgba(244, 228, 188, 0.6)' }}>
              PAUSED
            </div>
            
            <motion.button
              onClick={handleResume}
              className="bg-[#D2B48C] text-[#2E1A0F] px-8 py-4 rounded-lg cursor-pointer tracking-wider 
                         hover:bg-opacity-90 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ boxShadow: '0 0 20px rgba(210, 180, 140, 0.4)' }}
            >
              RESUME
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Game Content with conditional blur */}
      <div className={gamePaused ? 'blur-sm' : ''}>
        {/* UI */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="text-[#F4E4BC] text-xl sm:text-2xl md:text-3xl tracking-wider" 
               style={{ textShadow: '0 0 10px rgba(244, 228, 188, 0.6)' }}>
            {score}m
          </div>
        </div>

        {/* Pause Button */}
        <div className="absolute top-4 right-4 z-10">
          <motion.button
            onClick={handlePause}
            className="bg-black bg-opacity-25 text-[#F4E4BC] w-12 h-12 rounded-lg cursor-pointer 
                       hover:bg-opacity-35 transition-all duration-300 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </motion.button>
        </div>
      
        {/* Nutrient Meter */}
        <div className="absolute top-4 left-4 z-10">
        <div className="text-[#F4E4BC] text-xs opacity-70 mb-1 hidden sm:block">BOOST</div>
        <div className="w-12 sm:w-16 h-2 bg-black bg-opacity-35 rounded-full">
          <div 
            className="h-full bg-[#32CD32] rounded-full transition-all duration-300"
            style={{ 
              width: `${nutrientMeter}%`,
              boxShadow: nutrientMeter > 80 ? '0 0 8px #32CD32' : 'none'
            }}
          />
        </div>
      </div>

        {/* Shield Timer */}
        {hasShield && (
          <div className="absolute top-16 right-4 z-10">
          <div className="text-[#FFA500] text-xs opacity-70 mb-1 hidden sm:block">SHIELD</div>
          <div className="w-12 sm:w-16 h-2 bg-black bg-opacity-35 rounded-full">
            <div 
              className="h-full bg-[#FFA500] rounded-full transition-all duration-100"
              style={{ 
                width: `${(shieldTimeLeft / 8000) * 100}%`,
                boxShadow: '0 0 8px #FFA500'
              }}
            />
          </div>
          </div>
        )}

        {/* Destroyer Timer */}
        {destroyerActive && (
          <div className="absolute top-28 right-4 z-10">
          <div className="text-[#FF4500] text-xs opacity-70 mb-1 hidden sm:block">DESTROY</div>
          <div className="w-12 sm:w-16 h-2 bg-black bg-opacity-35 rounded-full">
            <div 
              className="h-full bg-[#FF4500] rounded-full transition-all duration-100"
              style={{ 
                width: `${(destroyerTimeLeft / 6000) * 100}%`,
                boxShadow: '0 0 8px #FF4500'
              }}
            />
          </div>
          </div>
        )}

        {/* Power-Up Heads Up Display */}
        {powerUpHeadsUp.length > 0 && (
          <div className="absolute top-12 left-0 right-0 z-10">
            {powerUpHeadsUp.map(headsUp => (
              <motion.div
                key={headsUp.id}
                className={`absolute w-3 h-3 rounded-full ${
                  headsUp.type === 'shield' 
                    ? 'bg-[#FFA500]' 
                    : headsUp.type === 'nutrient' 
                      ? 'bg-[#32CD32]' 
                      : 'bg-[#FF4500]'
                }`}
                style={{
                  left: `${headsUp.x}%`,
                  transform: 'translateX(-50%)',
                  boxShadow: `0 0 12px ${
                    headsUp.type === 'shield' 
                      ? '#FFA500' 
                      : headsUp.type === 'nutrient' 
                        ? '#32CD32' 
                        : '#FF4500'
                  }`,
                  opacity: Math.min(1, headsUp.timeLeft / 1000) // Fade in over first second
                }}
                animate={{ 
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            ))}
            <div className="text-center text-[#F4E4BC] opacity-60 text-xs mt-4">
              INCOMING
            </div>
          </div>
        )}

        {/* Obstacle Warning Display */}
        {obstacleWarnings.length > 0 && (
          <div className="absolute top-20 left-0 right-0 z-10">
            {obstacleWarnings.map(warning => (
              <motion.div
                key={warning.id}
                className="absolute"
                style={{
                  left: `${warning.x}%`,
                  width: `${warning.width}%`,
                  height: '8px',
                  transform: 'translateX(0)'
                }}
              >
                {/* Warning bar */}
                <div 
                  className={`w-full h-full ${
                    warning.type === 'glass' 
                      ? 'bg-gradient-to-r from-[#8B7D6B] to-[#6B7D6B]' 
                      : 'bg-[#7A6B5D]'
                  } opacity-70`}
                  style={{
                    boxShadow: warning.type === 'glass' 
                      ? '0 0 12px rgba(139, 125, 107, 0.6)' 
                      : '0 0 8px rgba(122, 107, 93, 0.6)',
                    animation: 'pulse 1s infinite'
                  }}
                />
                
                {/* Danger triangles at edges */}
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                  <motion.div
                    className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-transparent border-b-[#CD5C5C]"
                    animate={{ 
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ 
                      duration: 0.8, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    style={{
                      filter: 'drop-shadow(0 0 4px rgba(205, 92, 92, 0.8))'
                    }}
                  />
                </div>
                
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                  <motion.div
                    className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-transparent border-b-[#CD5C5C]"
                    animate={{ 
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ 
                      duration: 0.8, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.2
                    }}
                    style={{
                      filter: 'drop-shadow(0 0 4px rgba(205, 92, 92, 0.8))'
                    }}
                  />
                </div>
              </motion.div>
            ))}
            <div className="text-center text-[#CD5C5C] opacity-80 text-xs mt-3">
              ⚠ WIDE OBSTACLE ⚠
            </div>
          </div>
        )}

        {/* Control Instructions (Desktop) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 hidden md:block">
          <div className="text-[#F4E4BC] opacity-40 text-sm text-center">
            Use Arrow Keys or A/D • Tap Left/Right on Mobile
          </div>
        </div>

        {/* Root Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {rootPath.map((segment, index) => (
          <circle
            key={index}
            cx={`${segment.x}%`}
            cy={`${segment.y}%`}
            r="3"
            fill="#F4E4BC"
            style={{
              filter: destroyerActive 
                ? 'drop-shadow(0 0 12px #FF4500)' 
                : hasShield 
                  ? 'drop-shadow(0 0 10px #FFA500)' 
                  : 'drop-shadow(0 0 8px rgba(244, 228, 188, 0.6))',
              opacity: index / rootPath.length
            }}
          />
        ))}
        
        {rootPath.length > 1 && (
          <path
            d={`M ${rootPath.map(seg => `${seg.x} ${seg.y}`).join(' L ')}`}
            stroke="#F4E4BC"
            strokeWidth="2"
            fill="none"
            style={{
              filter: destroyerActive 
                ? 'drop-shadow(0 0 10px #FF4500)' 
                : hasShield 
                  ? 'drop-shadow(0 0 8px #FFA500)' 
                  : 'drop-shadow(0 0 6px rgba(244, 228, 188, 0.4))',
              opacity: 0.8
            }}
          />
        )}
        </svg>

        {/* Shield Effect */}
        {hasShield && rootPath.length > 0 && (
          <div
            className="absolute w-8 h-8 border-2 border-[#FFA500] rounded-full pointer-events-none"
            style={{
              left: `${rootPath[rootPath.length - 1].x}%`,
              top: `${rootPath[rootPath.length - 1].y}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 15px #FFA500',
              animation: 'pulse 2s infinite'
            }}
          />
        )}

        {/* Destroyer Effect */}
        {destroyerActive && rootPath.length > 0 && (
          <>
            <div
              className="absolute w-12 h-12 border-2 border-[#FF4500] rounded-full pointer-events-none"
              style={{
                left: `${rootPath[rootPath.length - 1].x}%`,
                top: `${rootPath[rootPath.length - 1].y}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 20px #FF4500',
                animation: 'pulse 1.5s infinite'
              }}
            />
            <div
              className="absolute w-16 h-16 border border-[#FF4500] rounded-full pointer-events-none opacity-60"
              style={{
                left: `${rootPath[rootPath.length - 1].x}%`,
                top: `${rootPath[rootPath.length - 1].y}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 25px #FF4500',
                animation: 'pulse 1s infinite'
              }}
            />
          </>
        )}

        {/* Obstacles */}
        {obstacles.map(obstacle => (
        <motion.div
          key={obstacle.id}
          className={`absolute pointer-events-none ${
            obstacle.type === 'glass' 
              ? 'bg-gradient-to-br from-[#8B7D6B] to-[#6B7D6B]' 
              : 'bg-[#7A6B5D]'
          }`}
          style={{
            left: `${obstacle.x}%`,
            top: `${obstacle.y}%`,
            width: `${obstacle.width}%`,
            height: `${obstacle.height}%`,
            boxShadow: obstacle.type === 'glass' 
              ? '0 0 12px rgba(139, 125, 107, 0.4), inset 0 0 8px rgba(255, 255, 255, 0.15)' 
              : 'inset 0 0 5px rgba(0, 0, 0, 0.3)',
            borderRadius: obstacle.type === 'glass' ? '2px' : '4px',
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 0, rotate: 0 }}
          animate={{ 
            scale: 1, 
            rotate: obstacle.type === 'glass' ? [0, 5, -5, 0] : 0 
          }}
          transition={{ 
            scale: { duration: 0.3 },
            rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          />
        ))}

        {/* Power-ups - Larger and more visible */}
        {powerUps.map(powerUp => (
        <motion.div
          key={powerUp.id}
          className={`absolute w-8 h-8 rounded-full pointer-events-none ${
            powerUp.type === 'shield' 
              ? 'bg-[#FFA500]' 
              : powerUp.type === 'nutrient' 
                ? 'bg-[#32CD32]' 
                : 'bg-[#FF4500]'
          }`}
          style={{
            left: `${powerUp.x}%`,
            top: `${powerUp.y}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 25px ${
              powerUp.type === 'shield' 
                ? '#FFA500' 
                : powerUp.type === 'nutrient' 
                  ? '#32CD32' 
                  : '#FF4500'
            }`
          }}
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 1.0, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          initial={{ scale: 0 }}
        >
          {/* Inner glow effect */}
          <div 
            className={`absolute inset-1 rounded-full ${
              powerUp.type === 'shield' 
                ? 'bg-[#FFA500]' 
                : powerUp.type === 'nutrient' 
                  ? 'bg-[#32CD32]' 
                  : 'bg-[#FF4500]'
            }`}
            style={{ 
              opacity: 0.8,
              boxShadow: `inset 0 0 12px rgba(255, 255, 255, 0.95)`
            }}
          />
          
          {/* Power-up type indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            {powerUp.type === 'shield' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V19H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z" />
              </svg>
            ) : powerUp.type === 'nutrient' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V21A2,2 0 0,0 5,23H19A2,2 0 0,0 21,21V9M19,9H14V4H15V3H5V19H19V9Z" />
              </svg>
            )}
          </div>
        </motion.div>
        ))}



        {/* Collision Animation Effects */}
        {collisionAnimating && collisionData && (
          <>
            {/* Screen Shake Container */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                x: [0, -5, 5, -3, 3, -1, 1, 0],
                y: [0, -3, 3, -2, 2, -1, 1, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: 2,
                ease: "easeInOut"
              }}
            >
              {/* Impact Flash */}
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0, 0.4, 0] }}
                transition={{ duration: 0.8, times: [0, 0.1, 0.2, 0.4, 1] }}
              />
              
              {/* Red overlay for damage */}
              <motion.div
                className="absolute inset-0 bg-red-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0.1, 0] }}
                transition={{ duration: 1.5, times: [0, 0.2, 0.8, 1] }}
              />
            </motion.div>

            {/* Particle Explosion */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-3 h-3 rounded-full ${
                    collisionData.type === 'glass' 
                      ? 'bg-gradient-to-br from-[#8B7D6B] to-[#6B7D6B]' 
                      : 'bg-[#7A6B5D]'
                  }`}
                  style={{
                    left: `${collisionData.x}%`,
                    top: `${collisionData.y}%`,
                    boxShadow: collisionData.type === 'glass' 
                      ? '0 0 8px rgba(139, 125, 107, 0.6)' 
                      : '0 0 6px rgba(122, 107, 93, 0.5)'
                  }}
                  initial={{ 
                    scale: 0,
                    x: 0,
                    y: 0,
                    opacity: 1
                  }}
                  animate={{
                    scale: [0, 1, 0.5, 0],
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                    opacity: [1, 1, 0.7, 0],
                    rotate: Math.random() * 720
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.05,
                    ease: "easeOut"
                  }}
                />
              ))}
              
              {/* Central explosion effect */}
              <motion.div
                className="absolute w-32 h-32 rounded-full border-4 border-red-500"
                style={{
                  left: `${collisionData.x}%`,
                  top: `${collisionData.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 2, 4], 
                  opacity: [1, 0.5, 0],
                  borderWidth: [4, 2, 0]
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              
              {/* Secondary shockwave */}
              <motion.div
                className="absolute w-64 h-64 rounded-full border-2 border-orange-400"
                style={{
                  left: `${collisionData.x}%`,
                  top: `${collisionData.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ 
                  scale: [0, 1, 3], 
                  opacity: [0.8, 0.3, 0],
                  borderWidth: [2, 1, 0]
                }}
                transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
              />
            </div>

            {/* Dramatic slow motion indicators */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.3, 0] }}
              transition={{ duration: 2 }}
            >
              <div className="absolute inset-0 bg-gradient-radial from-transparent via-red-900/20 to-transparent" />
              {/* Time distortion effects */}
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 border border-white/10 rounded-full"
                  style={{
                    left: `${collisionData.x}%`,
                    top: `${collisionData.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ 
                    scale: [0, 8], 
                    opacity: [0.8, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: i * 0.3,
                    ease: "easeOut" 
                  }}
                />
              ))}
            </motion.div>
          </>
        )}


      </div>
    </div>
  )
}