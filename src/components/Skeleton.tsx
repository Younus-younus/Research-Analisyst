// Generic skeleton component
export const Skeleton = ({ width = "100%", height = "20px", className = "" }) => (
  <div 
    className={`animate-pulse bg-gray-300 rounded ${className}`} 
    style={{ width, height }}
  />
);

// Research card skeleton
export const ResearchCardSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
    {/* Category badge */}
    <div className="mb-4">
      <Skeleton width="120px" height="24px" className="rounded-full" />
    </div>
    
    {/* Title */}
    <Skeleton width="80%" height="28px" className="mb-3" />
    
    {/* Author info */}
    <div className="flex items-center gap-3 mb-4">
      <Skeleton width="40px" height="40px" className="rounded-full" />
      <div className="flex-1">
        <Skeleton width="120px" height="16px" className="mb-1" />
        <Skeleton width="80px" height="14px" />
      </div>
    </div>
    
    {/* Content preview */}
    <div className="space-y-2 mb-4">
      <Skeleton width="100%" height="16px" />
      <Skeleton width="90%" height="16px" />
      <Skeleton width="75%" height="16px" />
    </div>
    
    {/* Footer */}
    <div className="flex justify-between items-center">
      <Skeleton width="80px" height="14px" />
      <Skeleton width="60px" height="14px" />
    </div>
  </div>
);

// User profile skeleton
export const UserProfileSkeleton = () => (
  <div className="flex items-center gap-3 animate-pulse">
    <Skeleton width="40px" height="40px" className="rounded-full" />
    <Skeleton width="100px" height="20px" />
  </div>
);

// Search results skeleton
export const SearchResultsSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 6 }).map((_, index) => (
      <ResearchCardSkeleton key={index} />
    ))}
  </div>
);

// Category grid skeleton
export const CategoryGridSkeleton = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="flex flex-col items-center">
          <Skeleton width="48px" height="48px" className="rounded mb-4" />
          <Skeleton width="120px" height="24px" className="mb-2" />
          <div className="text-center space-y-1">
            <Skeleton width="100%" height="16px" />
            <Skeleton width="80%" height="16px" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Button skeleton
export const ButtonSkeleton = ({ width = "120px", height = "40px" }) => (
  <Skeleton width={width} height={height} className="rounded-lg" />
);

// Form skeleton
export const FormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div>
      <Skeleton width="80px" height="20px" className="mb-2" />
      <Skeleton width="100%" height="40px" className="rounded-lg" />
    </div>
    <div>
      <Skeleton width="100px" height="20px" className="mb-2" />
      <Skeleton width="100%" height="40px" className="rounded-lg" />
    </div>
    <div>
      <Skeleton width="120px" height="20px" className="mb-2" />
      <Skeleton width="100%" height="120px" className="rounded-lg" />
    </div>
    <ButtonSkeleton width="140px" height="44px" />
  </div>
);

// Navigation skeleton
export const NavbarSkeleton = () => (
  <div className="flex justify-between items-center p-4 animate-pulse">
    <Skeleton width="150px" height="32px" />
    <div className="flex items-center gap-4">
      <Skeleton width="80px" height="36px" className="rounded-lg" />
      <UserProfileSkeleton />
    </div>
  </div>
);
