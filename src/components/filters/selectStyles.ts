import { ChakraStylesConfig } from 'chakra-react-select';

export const chakraSelectStyles: ChakraStylesConfig = {
  dropdownIndicator: (provided) => ({
    ...provided,
    bg: 'transparent',
    px: 2,
    cursor: 'inherit',
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    display: 'none',
  }),
  control: (provided) => ({
    ...provided,
    minHeight: '40px',
    borderRadius: 'md',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 10,
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: '200px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'orange.500' : provided.backgroundColor,
    color: state.isSelected ? 'white' : provided.color,
    _hover: {
      backgroundColor: state.isSelected ? 'orange.600' : 'gray.100',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'orange.100',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'orange.800',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: 'orange.600',
    _hover: {
      backgroundColor: 'orange.200',
      color: 'orange.800',
    },
  }),
};