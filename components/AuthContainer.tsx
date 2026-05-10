'use client';

import { useState } from 'react';
import LoginForm from './LoginModal';
import SignupForm from './SignupModal';

export default function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);
  const toggleView = () => setIsLogin(!isLogin);

  return (
    <div className="w-full max-w-md rounded-2xl bg-card border border-border p-8 shadow-xl">
      {/* This is Conditional Rendering. React handles the "unrendering" automatically. */}
      {isLogin ? (
        <LoginForm onToggle={toggleView} />
      ) : (
        <SignupForm onToggle={toggleView} />
      )}
    </div>
  );
}