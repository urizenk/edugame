/* eslint-env node */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6ff',
          100: '#d6e8ff',
          200: '#b3d4ff',
          300: '#80b7ff',
          400: '#4d99ff',
          500: '#1f7cff',
          600: '#0a66e6',
          700: '#084ebe',
          800: '#083f96',
          900: '#0a3577'
        },
        ink: {
          50: '#f4f7fb',
          100: '#d9e2f1',
          200: '#bccbe3',
          300: '#9bb1d3',
          400: '#7997c2',
          500: '#5f7dad',
          600: '#4f6787',
          700: '#405064',
          800: '#2d3642',
          900: '#161c21'
        },
        // 学前教育温暖流动配色 - 柔和渐变系
        playful: {
          // 桃粉色系 - 主色调
          peach: {
            50: '#fff5f7',
            100: '#ffe8ee',
            200: '#ffd1dd',
            300: '#ffb3cb',
            400: '#ff8fb3',
            500: '#ff6b9d',
            600: '#ff4d8a',
            700: '#f73d7f',
            800: '#e02d6f',
            900: '#c91f5f'
          },
          // 珊瑚橙色系 - 温暖过渡
          coral: {
            50: '#fff8f5',
            100: '#ffede4',
            200: '#ffdbc9',
            300: '#ffc4a4',
            400: '#ffa87a',
            500: '#ff8c5a',
            600: '#ff7043',
            700: '#f95d35',
            800: '#e84a28',
            900: '#d13a1c'
          },
          // 蜜桃黄色系 - 柔和亮色
          honey: {
            50: '#fffbf0',
            100: '#fff6dd',
            200: '#ffedbb',
            300: '#ffe299',
            400: '#ffd670',
            500: '#ffca4a',
            600: '#ffbe2e',
            700: '#f5b01f',
            800: '#e09f12',
            900: '#c88a08'
          },
          // 薄荷绿色系 - 清新点缀
          mint: {
            50: '#f0fff7',
            100: '#e0ffef',
            200: '#c1ffdf',
            300: '#8fffc7',
            400: '#5cffaf',
            500: '#36f799',
            600: '#1fe085',
            700: '#15c972',
            800: '#0fb060',
            900: '#0a9850'
          },
          // 薰衣草紫色系 - 梦幻点缀
          lavender: {
            50: '#faf8ff',
            100: '#f5f0ff',
            200: '#ebe0ff',
            300: '#ddc9ff',
            400: '#c9a8ff',
            500: '#b588ff',
            600: '#a06cff',
            700: '#8d57f5',
            800: '#7743e0',
            900: '#6333c7'
          }
        }
      },
      fontFamily: {
        display: ['"Poppins"', 'Avenir', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body: ['"Source Han Sans SC"', '"Noto Sans SC"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        floating: '0 12px 30px -12px rgba(31, 124, 255, 0.35)',
        playful: '0 10px 40px -15px rgba(255, 61, 148, 0.3)',
        rainbow: '0 8px 32px -8px rgba(168, 85, 247, 0.4)'
      },
      backgroundImage: {
        'rainbow-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        'playful-dots': 'radial-gradient(circle, rgba(255,61,148,0.15) 1px, transparent 1px)',
        'playful-pattern': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(168,85,247,0.03) 10px, rgba(168,85,247,0.03) 20px)'
      },
      backgroundSize: {
        'dots': '20px 20px'
      },
      animation: {
        'bounce-gentle': 'bounce 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'bubble-pop-in': 'bubblePopIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bubble-float-1': 'bubbleFloat1 3s ease-in-out infinite',
        'bubble-float-2': 'bubbleFloat2 4s ease-in-out infinite',
        'bubble-float-3': 'bubbleFloat3 5s ease-in-out infinite',
        'bubble-wobble': 'bubbleWobble 2s ease-in-out infinite',
        'bubble-pulse': 'bubblePulse 2s ease-in-out infinite',
        'bubble-glow': 'bubbleGlow 2s ease-in-out infinite',
        'bubble-bounce-in': 'bubbleBounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bubble-shimmer': 'bubbleShimmer 3s linear infinite',
        'blob': 'blob 7s infinite',
        'slideDown': 'slideDown 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out'
      },
      animationDelay: {
        '2000': '2s',
        '4000': '4s',
        '6000': '6s',
        '8000': '8s'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        bubblePopIn: {
          '0%': {
            transform: 'scale(0)',
            opacity: '0'
          },
          '50%': {
            transform: 'scale(1.15)'
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1'
          }
        },
        bubbleFloat1: {
          '0%, 100%': {
            transform: 'translateY(0px) translateX(0px)',
          },
          '25%': {
            transform: 'translateY(-8px) translateX(5px)',
          },
          '75%': {
            transform: 'translateY(-5px) translateX(-5px)',
          }
        },
        bubbleFloat2: {
          '0%, 100%': {
            transform: 'translateY(0px) translateX(0px)',
          },
          '33%': {
            transform: 'translateY(-10px) translateX(-6px)',
          },
          '66%': {
            transform: 'translateY(-6px) translateX(6px)',
          }
        },
        bubbleFloat3: {
          '0%, 100%': {
            transform: 'translateY(0px) translateX(0px)',
          },
          '40%': {
            transform: 'translateY(-7px) translateX(4px)',
          },
          '80%': {
            transform: 'translateY(-12px) translateX(-4px)',
          }
        },
        bubbleWobble: {
          '0%, 100%': {
            transform: 'rotate(0deg)'
          },
          '25%': {
            transform: 'rotate(3deg)'
          },
          '75%': {
            transform: 'rotate(-3deg)'
          }
        },
        bubblePulse: {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          },
          '50%': {
            transform: 'scale(1.05)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
          }
        },
        bubbleGlow: {
          '0%, 100%': {
            filter: 'brightness(1) drop-shadow(0 0 0px rgba(255, 255, 255, 0))'
          },
          '50%': {
            filter: 'brightness(1.2) drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))'
          }
        },
        bubbleBounceIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3) translateY(50px)'
          },
          '50%': {
            opacity: '0.9',
            transform: 'scale(1.1)'
          },
          '70%': {
            transform: 'scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)'
          }
        },
        bubbleShimmer: {
          '0%': {
            backgroundPosition: '-200% center'
          },
          '100%': {
            backgroundPosition: '200% center'
          }
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)'
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)'
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)'
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)'
          }
        },
        slideDown: {
          '0%': {
            opacity: '0',
            transform: 'translate(-50%, -20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translate(-50%, 0)'
          }
        },
        slideUp: {
          '0%': {
            opacity: '1',
            transform: 'translate(-50%, 0)'
          },
          '100%': {
            opacity: '0',
            transform: 'translate(-50%, -20px)'
          }
        }
      }
    }
  },
  plugins: []
};
