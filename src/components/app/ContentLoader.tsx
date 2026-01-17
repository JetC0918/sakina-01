import { motion } from "framer-motion";

export const ContentLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full space-y-8">
            <div className="relative flex items-center justify-center">
                {/* Outer glowing ring */}
                <motion.div
                    className="absolute w-24 h-24 rounded-full border-2 border-primary/20"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Middle pulsing ring */}
                <motion.div
                    className="absolute w-16 h-16 rounded-full border-2 border-primary/40"
                    animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2,
                    }}
                />

                {/* Inner spinning element */}
                <motion.div
                    className="w-8 h-8 rounded-full border-t-2 border-primary"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            </div>

            <div className="flex flex-col items-center space-y-2">
                <motion.h3
                    className="text-lg font-medium text-foreground/80"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Loading your space...
                </motion.h3>
                <motion.div
                    className="h-1 w-32 bg-secondary rounded-full overflow-hidden"
                >
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
};
