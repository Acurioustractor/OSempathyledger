import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />}>
      <BreadcrumbItem>
        <BreadcrumbLink as={RouterLink} to="/">Home</BreadcrumbLink>
      </BreadcrumbItem>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        // Capitalize the first letter for display
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);

        return (
          <BreadcrumbItem key={routeTo} isCurrentPage={isLast}>
            <BreadcrumbLink as={RouterLink} to={routeTo} >
              {displayName}
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default Breadcrumbs; 