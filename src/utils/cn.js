/** Join conditional class names: cn('a', condition && 'b') */
export const cn = (...classes) => classes.filter(Boolean).join(' ');
