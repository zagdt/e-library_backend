/**
 * Password strength validation utility
 * Implements best practices for password security
 */

export interface PasswordStrengthResult {
    isValid: boolean;
    score: number; // 0-4 (weak to strong)
    errors: string[];
    suggestions: string[];
}

const PASSWORD_RULES = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
};

const COMMON_PASSWORDS = new Set([
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    '1234567', '12345', '123456789', 'password1', 'iloveyou',
]);

/**
 * Check password strength
 */
export const checkPasswordStrength = (password: string): PasswordStrengthResult => {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Length check
    if (password.length < PASSWORD_RULES.minLength) {
        errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters`);
    } else if (password.length >= PASSWORD_RULES.minLength) {
        score++;
        if (password.length >= 12) score++;
    }

    if (password.length > PASSWORD_RULES.maxLength) {
        errors.push(`Password must be no more than ${PASSWORD_RULES.maxLength} characters`);
    }

    // Uppercase check
    if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(password)) {
        score += 0.5;
    }

    // Lowercase check
    if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(password)) {
        score += 0.5;
    }

    // Number check
    if (PASSWORD_RULES.requireNumbers && !/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    } else if (/[0-9]/.test(password)) {
        score += 0.5;
    }

    // Special character check
    if (PASSWORD_RULES.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score += 0.5;
    }

    // Common password check
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
        errors.push('Password is too common, please choose a more unique password');
        score = Math.max(0, score - 2);
    }

    // Suggestions
    if (score < 2) {
        suggestions.push('Use a mix of letters, numbers, and special characters');
    }
    if (password.length < 12) {
        suggestions.push('Consider using a longer password (12+ characters)');
    }
    if (/(.)\1{2,}/.test(password)) {
        suggestions.push('Avoid repeating characters');
        score = Math.max(0, score - 0.5);
    }

    return {
        isValid: errors.length === 0,
        score: Math.min(4, Math.floor(score)),
        errors,
        suggestions,
    };
};

/**
 * Validate password meets minimum requirements
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
    const result = checkPasswordStrength(password);

    if (!result.isValid) {
        return {
            valid: false,
            message: result.errors[0],
        };
    }

    return { valid: true };
};
