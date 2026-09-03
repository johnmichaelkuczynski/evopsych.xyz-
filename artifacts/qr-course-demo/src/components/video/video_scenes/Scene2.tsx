import { motion } from 'framer-motion';

export function Scene2() {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-900"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: '-20vw' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute w-[120vw] h-[120vw] rounded-full bg-blue-600/20 blur-[80px]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      <motion.div
        className="relative z-10 w-[90vw] h-[75vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white"
        initial={{ y: '10vh', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img 
          src={`${import.meta.env.BASE_URL}images/evopsych-dashboard.jpg`}
          className="w-full h-auto object-cover object-top origin-top"
          initial={{ scale: 1 }}
          animate={{ scale: 1.15, y: '-15%' }}
          transition={{ duration: 6.5, ease: "linear" }}
        />
      </motion.div>

      <motion.div 
        className="absolute top-[8vh] left-[5vw] right-[5vw] z-20 flex flex-col items-center"
        initial={{ opacity: 0, y: '-5vh' }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bg-slate-900/90 backdrop-blur-md px-[6vw] py-[2.5vh] rounded-2xl shadow-xl border border-white/10 text-center w-full">
          <h2 className="text-[8vw] font-bold tracking-tight leading-tight mb-1 text-white">
            29 Micro-Lectures
          </h2>
          <p className="text-[4.5vw] text-blue-300 font-medium">
            Track your progress visually
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}