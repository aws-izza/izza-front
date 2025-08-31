import styled from "styled-components";

export const SidebarContainer = styled.div`
  width: 420px;
  height: 100vh;
  background: #ffffff;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
  border-right: 1px solid #e5e7eb;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 8px;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const Title = styled.h1`
  color: #1f2937;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
`;

export const SearchBox = styled.div`
  position: relative;
  margin-bottom: 8px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  background: #f9fafb;
  color: #1f2937;
  transition: all 0.2s ease;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #5e9f00;
    box-shadow: 0 0 0 2px rgba(94, 159, 0, 0.1);
    background: #ffffff;
  }

  &:hover {
    border-color: #9ca3af;
    background: #ffffff;
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AutoCompleteContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 10px 10px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

export const AutoCompleteItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }

  &.highlighted {
    background-color: #f0fdf4;
  }
`;

export const HighlightedText = styled.span`
  color: #5e9f00;
  font-weight: 600;
`;

export const LoadingItem = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
`;

export const NoResultsItem = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
`;

export const TabContainer = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 8px;
`;

export const Tab = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.active ? "#ffffff" : "transparent"};
  color: ${(props) =>
    props.active ? "#1f2937" : "#6b7280"};
  box-shadow: ${(props) =>
    props.active ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)" : "none"};

  &:hover {
    color: ${(props) =>
      props.active ? "#1f2937" : "#374151"};
    background: ${(props) =>
      props.active ? "#ffffff" : "#e5e7eb"};
  }
`;

export const FilterSection = styled.div`
  background: transparent;
  padding: 0;
  margin-bottom: 20px;
`;

export const FilterTitle = styled.h3`
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
`;

export const DropdownContainer = styled.div`
  margin-bottom: 16px;
`;

export const DropdownLabel = styled.label`
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
`;

export const Dropdown = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: #f9fafb;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #5e9f00;
    box-shadow: 0 0 0 2px rgba(94, 159, 0, 0.1);
    background: #ffffff;
  }

  &:hover {
    border-color: #9ca3af;
    background: #ffffff;
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
    border-color: #e5e7eb;
    color: #9ca3af;
  }
`;

export const SliderContainer = styled.div`
  margin-bottom: 20px;
`;

export const SliderLabel = styled.div`
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
`;

export const SliderValues = styled.div`
  display: flex;
  justify-content: space-between;
  color: #6b7280;
  font-size: 12px;
  margin-top: 8px;
`;

export const SearchButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #5e9f00;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #4a7c00;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(94, 159, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const CategorySection = styled.div`
  margin-bottom: 25px;
`;

export const CategoryTitle = styled.h4`
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
`;

export const CheckboxContainer = styled.div`
  margin-bottom: 12px;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  padding: 8px 0;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f9fafb;
    padding: 8px 8px;
    margin: 0 -8px;
  }
`;

export const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  margin-right: 12px;
  accent-color: #5e9f00;
  cursor: pointer;
`;

export const RangeInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

export const RangeInput = styled.input`
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  color: #1f2937;
  background: #f9fafb;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #5e9f00;
    box-shadow: 0 0 0 2px rgba(94, 159, 0, 0.1);
    background: #ffffff;
  }

  &:hover {
    border-color: #9ca3af;
    background: #ffffff;
  }
`;

export const RangeSeparator = styled.span`
  color: #6b7280;
  font-weight: 500;
`;

export const IndicatorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 14px 16px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #f3f4f6;
`;

export const IndicatorName = styled.span`
  color: #1f2937;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
`;

export const WeightInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const WeightLabel = styled.span`
  color: #6b7280;
  font-size: 12px;
  white-space: nowrap;
`;

export const WeightInput = styled.input`
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  color: #1f2937;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #5e9f00;
    box-shadow: 0 0 0 2px rgba(94, 159, 0, 0.1);
  }

  &:hover {
    border-color: #9ca3af;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type=number] {
    -moz-appearance: textfield;
  }
`;

export const RequiredLabel = styled.span`
  color: #ef4444;
  font-size: 12px;
  margin-left: 4px;
`;

export const StyledSearchButton = styled(SearchButton)`
  background: ${props => props.disabled 
    ? '#d1d5db' 
    : props.variant === 'success' 
      ? '#5e9f00'
      : '#5e9f00'
  };
  
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background: ${props => props.disabled 
      ? '#d1d5db' 
      : props.variant === 'success' 
        ? '#4a7c00'
        : '#4a7c00'
    };
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 12px rgba(94, 159, 0, 0.2)'};
  }
  
  transition: all 0.2s ease;
`;

export const ErrorContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  color: #dc2626;
  font-size: 14px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
`;

export const ErrorContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

export const ErrorMessage = styled.span`
  flex: 1;
  line-height: 1.4;
`;

export const ErrorCloseButton = styled.button`
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(220, 38, 38, 0.1);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;