import React from 'react';
import { render } from '@testing-library/react';
import { Skeleton } from '../../../components/ui/Skeleton';

describe('Skeleton component', () => {
    it('renders with default props (rect variant)', () => {
        const { container } = render(<Skeleton />);
        const skeletonDiv = container.firstChild as HTMLElement;

        expect(skeletonDiv).toBeInTheDocument();
        expect(skeletonDiv).toHaveClass('animate-pulse');
        expect(skeletonDiv).toHaveClass('bg-slate-200');
        expect(skeletonDiv).toHaveClass('dark:bg-slate-800');
        expect(skeletonDiv).toHaveClass('rounded-md');
    });

    it('renders the circle variant correctly', () => {
        const { container } = render(<Skeleton variant="circle" />);
        const skeletonDiv = container.firstChild as HTMLElement;

        expect(skeletonDiv).toHaveClass('rounded-full');
        expect(skeletonDiv).not.toHaveClass('rounded-md');
    });

    it('renders the text variant correctly', () => {
        const { container } = render(<Skeleton variant="text" />);
        const skeletonDiv = container.firstChild as HTMLElement;

        expect(skeletonDiv).toHaveClass('rounded-md');
        expect(skeletonDiv).toHaveClass('h-4');
        expect(skeletonDiv).not.toHaveClass('rounded-full');
    });

    it('appends custom className correctly', () => {
        const customClass = 'my-custom-class';
        const { container } = render(<Skeleton className={customClass} />);
        const skeletonDiv = container.firstChild as HTMLElement;

        expect(skeletonDiv).toHaveClass(customClass);
        // Should still have base classes
        expect(skeletonDiv).toHaveClass('animate-pulse');
    });
});
