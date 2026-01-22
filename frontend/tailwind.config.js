import {
  blue,
  gray,
  grayDark,
  green,
  indigo,
  orange,
  purple,
  red,
  teal,
} from "@radix-ui/colors";
import { scrollbarWidth } from "tailwind-scrollbar-utilities";
import animate from "tailwindcss-animate";
import themes from "tailwindcss-themer";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  plugins: [
    animate,
    scrollbarWidth(),
    themes({
      themes: [
        {
          name: "light",
          extend: {
            dropShadow: {
              DEFAULT: "0px 0px 2px #E0E0E0",
              lg: "0px 0px 12px #E0E0E0",
              xl: "0px 0px 16px #E0E0E0",
              "bottom-md": "0px 2px 8px rgba(224, 224, 224, 0.25)",
            },
            boxShadow: {
              md: "0px 0px 4px 0px #E0E0E0",
              large: "0px 0px 8px #E0E0E0",
              xlarge: "0px 0px 12px 0px #E0E0E0",
              xl: "0px 0px 24px 0px #E0E0E0",
            },
            width: {
              8.5: "2.125rem",
              70: "17.5rem",
              320: "80rem",
              640: "160rem",
            },
            height: {
              8.5: "2.125rem",
              "screen-minus-12": "calc(100vh - 3rem)",
              "screen-minus-323": "calc(100vh - 323px)",
              "screen-minus-358": "calc(100vh - 358px)",
            },
            maxHeight: {
              "screen-minus-90": "calc(100vh - 75px)",
            },
            padding: {
              4.5: "1.125rem",
              38: "38px",
              72: "72px",
            },
            fontSize: {
              heading1: "22px",
              heading2: "20px",
              heading3: "18px",
              heading4: "16px",
              base: "14px",
              small: "12px",
              "extra-small": "11px",
            },
            lineHeight: {
              heading1: "150%",
              heading2: "120%",
              heading3: "120%",
              heading4: "160%",
              base: "160%",
              small: "140%",
              "extra-small": "120%",
            },
            colors: {
              surface: "hsl(0 0% 100%)",
              foreground: "hsl(0 0% 0%)",
              neutral: {
                1: gray.gray1,
                2: gray.gray2,
                3: gray.gray3,
                4: gray.gray4,
                5: gray.gray5,
                6: gray.gray6,
                7: gray.gray7,
                8: gray.gray8,
                9: gray.gray9,
                10: gray.gray10,
                11: gray.gray11,
                12: gray.gray12,
              },
              "neutral-inverted": {
                1: grayDark.gray1,
                2: grayDark.gray2,
                3: grayDark.gray3,
                4: grayDark.gray4,
                5: grayDark.gray5,
                6: grayDark.gray6,
                7: grayDark.gray7,
                8: grayDark.gray8,
                9: grayDark.gray9,
                10: grayDark.gray10,
                11: grayDark.gray11,
                12: grayDark.gray12,
              },
              primaryScale: {
                1: blue.blue1,
                2: blue.blue2,
                3: blue.blue3,
                4: blue.blue4,
                5: blue.blue5,
                6: blue.blue6,
                7: blue.blue7,
                8: blue.blue8,
                9: blue.blue9,
                10: blue.blue10,
                11: blue.blue11,
                12: blue.blue12,
              },
              accentScale: {
                1: orange.orange1,
                2: orange.orange2,
                3: orange.orange3,
                4: orange.orange4,
                5: orange.orange5,
                6: orange.orange6,
                7: orange.orange7,
                8: orange.orange8,
                9: orange.orange9,
                10: orange.orange10,
                11: orange.orange11,
                12: orange.orange12,
              },
              purpleScale: {
                1: purple.purple1,
                2: purple.purple2,
                3: purple.purple3,
                4: purple.purple4,
                5: purple.purple5,
                6: purple.purple6,
                7: purple.purple7,
                8: purple.purple8,
                9: purple.purple9,
                10: purple.purple10,
                11: purple.purple11,
                12: purple.purple12,
              },
              greenScale: {
                1: green.green1,
                2: green.green2,
                3: green.green3,
                4: green.green4,
                5: green.green5,
                6: green.green6,
                7: green.green7,
                8: green.green8,
                9: green.green9,
                10: green.green10,
                11: green.green11,
                12: green.green12,
              },
              redScale: {
                1: red.red1,
                2: red.red2,
                3: red.red3,
                4: red.red4,
                5: red.red5,
                6: red.red6,
                7: red.red7,
                8: red.red8,
                9: red.red9,
                10: red.red10,
                11: red.red11,
                12: red.red12,
              },
              indigoScale: {
                1: indigo.indigo1,
                2: indigo.indigo2,
                3: indigo.indigo3,
                4: indigo.indigo4,
                5: indigo.indigo5,
                6: indigo.indigo6,
                7: indigo.indigo7,
                8: indigo.indigo8,
                9: indigo.indigo9,
                10: indigo.indigo10,
                11: indigo.indigo11,
                12: indigo.indigo12,
              },
              tealScale: {
                1: teal.teal1,
                2: teal.teal2,
                3: teal.teal3,
                4: teal.teal4,
                5: teal.teal5,
                6: teal.teal6,
                7: teal.teal7,
                8: teal.teal8,
                9: teal.teal9,
                10: teal.teal10,
                11: teal.teal11,
                12: teal.teal12,
              },
            },
          },
        },
      ],
    }),
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    colors: {
      inherit: "inherit",
      current: "current",
      transparent: "transparent",
    },
    fontFamily: {
      sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      mono: ["ui-monospace", "SFMono-Regular", "monospace"],
    },
    extend: {
      width: { 70: "17.5rem" },

      /**
       * NotesAO theming (OUR system)
       * These are driven by src/index.css variables: --color-bg, --color-fg, etc.
       */
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        fg: "rgb(var(--color-fg) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          fg: "rgb(var(--color-primary-fg) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
          fg: "rgb(var(--color-muted-fg) / <alpha-value>)",
        },

        /**
         * Shadcn-style aliases (USED by your Input component)
         * We map them to the same NotesAO variables so you don’t maintain two theme systems.
         */
        background: "rgb(var(--color-bg) / <alpha-value>)",
        foreground: "rgb(var(--color-fg) / <alpha-value>)",
        input: "rgb(var(--color-border) / <alpha-value>)",
        ring: "rgb(var(--color-primary) / <alpha-value>)",
      },

      borderRadius: {
        lg: "var(--radius, 0.75rem)",
        md: "calc(var(--radius, 0.75rem) - 2px)",
        sm: "calc(var(--radius, 0.75rem) - 4px)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      gridTemplateRows: {
        8: "repeat(8, minmax(0, 1fr))",
      },
    },
  },
};