import { motion } from 'framer-motion';

export function Scene3() {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-950"
      initial={{ opacity: 0, x: '20vw' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="relative z-10 w-[90vw] h-[80vh] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)] border border-blue-500/30 bg-white"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img 
          src={`${import.meta.env.BASE_URL}images/evopsych-lecture.jpg`}
          className="w-[150%] max-w-none h-auto object-cover object-top origin-top-right"
          initial={{ x: '-30%', y: 0 }}
          animate={{ x: '-20%', y: '-10%' }}
          transition={{ duration: 5.5, ease: "linear" }}
        />
      </motion.div>

      <motion.div 
        className="absolute bottom-[5vh] left-[5vw] right-[5vw] z-20 flex flex-col items-center"
        initial={{ opacity: 0, y: '5vh' }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bg-slate-900/95 backdrop-blur-xl px-[6vw] py-[3vh] rounded-2xl shadow-2xl border border-white/10 text-center w-full">
          <div className="flex items-center justify-center gap-[2vw] mb-[1vh]">
            <motion.div 
              className="w-[4vw] h-[4vw] bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <h2 className="text-[7.5vw] font-bold tracking-tight text-white">
              AI Tutor built-in
            </h2>
          </div>
          <p className="text-[4.5vw] text-slate-300 font-medium leading-snug">
            Real-time feedback &<br/>AI-graded tests
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}