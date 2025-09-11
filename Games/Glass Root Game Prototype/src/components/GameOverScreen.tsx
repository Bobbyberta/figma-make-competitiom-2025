import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

interface GameOverScreenProps {
  score: number
  highScore: number
  onRestart: () => void
  onBackToMenu: () => void
}

export function GameOverScreen({ score, highScore, onRestart, onBackToMenu }: GameOverScreenProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const [showNewRecord, setShowNewRecord] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)

  const isNewRecord = score === highScore && score > 0

  // Game URL - published Figma site
  const gameUrl = 'https://money-slam-87642572.figma.site'
  
  // Share text generator
  const getShareText = (platform: 'twitter' | 'facebook' | 'generic') => {
    const baseText = isNewRecord 
      ? `🎯 NEW RECORD! I just guided a tree root ${score}m deep in Glass Root! 🌳` 
      : `🌳 I just guided a tree root ${score}m deep in Glass Root! Can you beat my score?`
    
    switch (platform) {
      case 'twitter':
        return `${baseText} #GlassRoot #IndieGame`
      case 'facebook':
        return baseText
      case 'generic':
        return `${baseText}\n\nPlay at: ${gameUrl}`
    }
  }

  // Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Glass Root - High Score',
          text: getShareText('generic'),
          url: gameUrl
        })
      } catch (error) {
        console.log('Share cancelled or failed')
      }
    }
  }

  // Twitter/X share
  const handleTwitterShare = () => {
    const text = encodeURIComponent(getShareText('twitter'))
    const url = encodeURIComponent(gameUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  // Facebook share
  const handleFacebookShare = () => {
    const url = encodeURIComponent(gameUrl)
    const quote = encodeURIComponent(getShareText('facebook'))
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank')
  }

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${getShareText('generic')}\n\n${gameUrl}`)
      // Could add a toast notification here
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = `${getShareText('generic')}\n\n${gameUrl}`
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  // Animate score counting up
  useEffect(() => {
    if (score === 0) return

    const duration = 1500 // 1.5 seconds
    const steps = 60
    const increment = score / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setDisplayScore(score)
        clearInterval(timer)
        
        // Show new record after score animation
        if (isNewRecord) {
          setTimeout(() => setShowNewRecord(true), 300)
        }
      } else {
        setDisplayScore(Math.floor(increment * currentStep))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score, isNewRecord])

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Shattered Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-[#4D4DFF] to-[#9A00FF] rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 10px rgba(77, 77, 255, 0.6)'
            }}
            initial={{ 
              scale: 0, 
              rotate: 0,
              opacity: 0 
            }}
            animate={{ 
              scale: [0, 1, 0.8], 
              rotate: Math.random() * 360,
              opacity: [0, 0.8, 0.4],
              y: [0, -20, 40]
            }}
            transition={{ 
              duration: 2,
              delay: i * 0.1,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Game Over Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl text-[#F4E4BC] mb-2 tracking-wider" 
            style={{ textShadow: '0 0 20px rgba(244, 228, 188, 0.4)' }}>
          BROKEN
        </h1>
        <div className="text-xl md:text-2xl text-[#F4E4BC] opacity-70 tracking-widest">
          ROOT SHATTERED
        </div>
      </motion.div>

      {/* Score Display */}
      <motion.div
        className="text-center mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
      >
        <div className="text-[#F4E4BC] opacity-80 mb-2 tracking-wide">
          DISTANCE
        </div>
        <div className="text-6xl md:text-8xl text-[#F4E4BC] mb-4" 
             style={{ textShadow: '0 0 30px rgba(244, 228, 188, 0.5)' }}>
          {displayScore}m
        </div>
        
        {/* New Record Badge */}
        {showNewRecord && (
          <motion.div
            className="inline-block bg-gradient-to-r from-[#32CD32] to-[#FFA500] text-black px-4 py-2 rounded-full text-sm tracking-wider mb-4"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.6 }}
            style={{ boxShadow: '0 0 20px rgba(124, 252, 0, 0.5)' }}
          >
            NEW RECORD!
          </motion.div>
        )}
        
        {/* High Score */}
        {!isNewRecord && highScore > 0 && (
          <div className="text-[#F5F5DC] opacity-60 text-lg">
            BEST: {highScore}m
          </div>
        )}
      </motion.div>

      {/* Share Section */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
        {!showShareOptions ? (
          <motion.button
            onClick={() => setShowShareOptions(true)}
            className="bg-transparent border border-[#F5F5DC] text-[#F5F5DC] px-6 py-2 rounded-lg 
                       hover:bg-[#F5F5DC] hover:text-[#3C2F2F] transition-all duration-300 
                       cursor-pointer tracking-wider text-sm flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.6 20.92,19A2.84,2.84 0 0,0 18,16.08Z" />
            </svg>
            SHARE SCORE
          </motion.button>
        ) : (
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Native Share (if available) */}
            {navigator.share && (
              <motion.button
                onClick={handleNativeShare}
                className="bg-[#F5F5DC] text-[#3C2F2F] px-4 py-2 rounded-lg cursor-pointer 
                           hover:bg-opacity-90 transition-all duration-300 flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.6 20.92,19A2.84,2.84 0 0,0 18,16.08Z" />
                </svg>
                SHARE
              </motion.button>
            )}

            {/* Twitter/X */}
            <motion.button
              onClick={handleTwitterShare}
              className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer 
                         hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </motion.button>

            {/* Facebook */}
            <motion.button
              onClick={handleFacebookShare}
              className="bg-[#1877F2] text-white px-4 py-2 rounded-lg cursor-pointer 
                         hover:bg-[#166FE5] transition-all duration-300 flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              FACEBOOK
            </motion.button>

            {/* Copy Link */}
            <motion.button
              onClick={handleCopyLink}
              className="bg-transparent border border-[#F5F5DC] text-[#F5F5DC] px-4 py-2 rounded-lg 
                         hover:bg-[#F5F5DC] hover:text-[#3C2F2F] transition-all duration-300 
                         cursor-pointer flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              COPY
            </motion.button>

            {/* Close button */}
            <motion.button
              onClick={() => setShowShareOptions(false)}
              className="bg-transparent text-[#F5F5DC] opacity-60 hover:opacity-100 px-2 py-2 
                         transition-all duration-300 cursor-pointer flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 items-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <motion.button
          onClick={onRestart}
          className="bg-[#F5F5DC] text-[#3C2F2F] px-8 py-3 rounded-lg cursor-pointer tracking-wider 
                     hover:bg-opacity-90 transition-all duration-300 min-w-[140px]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ boxShadow: '0 0 20px rgba(245, 245, 220, 0.3)' }}
        >
          TRY AGAIN
        </motion.button>
        
        <motion.button
          onClick={onBackToMenu}
          className="bg-transparent border-2 border-[#F5F5DC] text-[#F5F5DC] px-8 py-3 rounded-lg 
                     hover:bg-[#F5F5DC] hover:text-[#3C2F2F] transition-all duration-300 
                     cursor-pointer tracking-wider min-w-[140px]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          MENU
        </motion.button>
      </motion.div>

      {/* Performance Message */}
      <motion.div
        className="absolute bottom-8 text-center text-[#F5F5DC] opacity-50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        {score < 100 && "Keep practicing!"}
        {score >= 100 && score < 500 && "Getting the hang of it!"}
        {score >= 500 && score < 1000 && "Impressive navigation!"}
        {score >= 1000 && score < 2000 && "Master root guide!"}
        {score >= 2000 && "Legendary performance!"}
      </motion.div>
    </motion.div>
  )
}