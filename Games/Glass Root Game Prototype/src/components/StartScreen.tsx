import { motion } from 'motion/react'

interface StartScreenProps {
  onStart: () => void
  highScore: number
}

export function StartScreen({ onStart, highScore }: StartScreenProps) {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Title */}
      <motion.div
        className="text-center mb-12"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <h1 className="text-6xl md:text-8xl text-[#F4E4BC] mb-4 tracking-wider" 
            style={{ textShadow: '0 0 20px rgba(244, 228, 188, 0.4)' }}>
          GLASS
        </h1>
        <h2 className="text-2xl md:text-3xl text-[#F4E4BC] opacity-80 tracking-widest">
          ROOT
        </h2>
      </motion.div>

      {/* High Score */}
      {highScore > 0 && (
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="text-[#F4E4BC] opacity-70">
            BEST: {highScore}m
          </div>
        </motion.div>
      )}

      {/* Start Button */}
      <motion.button
        onClick={onStart}
        className="bg-transparent border-2 border-[#D2B48C] text-[#F4E4BC] px-12 py-4 rounded-lg 
                   hover:bg-[#D2B48C] hover:text-[#2E1A0F] transition-all duration-300 
                   cursor-pointer tracking-wider"
        style={{ textShadow: '0 0 10px rgba(244, 228, 188, 0.3)' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        TAP TO START
      </motion.button>

      {/* Instructions */}
      <motion.div
        className="absolute bottom-8 text-center text-[#F4E4BC] opacity-60 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <div className="mb-2">Tap left or right to steer</div>
        <div>Avoid the glass shards</div>
      </motion.div>
    </motion.div>
  )
}