# Contributing to Celebrio AI

Thank you for your interest in contributing to **Celebrio AI**! We welcome contributions to enhance event planning capabilities, theme generators, and accessibility features.

## Development Workflow

1. **Fork & Clone**:
   ```bash
   git clone https://github.com/mbajiya047/Celebrio-AI.git
   cd Celebrio-AI
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY to .env
   ```

4. **Run Automated Test Suite**:
   ```bash
   npm test
   ```

5. **Start Development Server**:
   ```bash
   npm start
   ```

## Pull Request Guidelines

- Ensure all 19 automated tests pass with `npm test`.
- Adhere to WCAG 2.1 AAA accessibility guidelines (proper ARIA attributes and high color contrast).
- Never commit real API keys or sensitive credentials.
