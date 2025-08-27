import styled from "styled-components";

export const SidebarContainer = styled.div`
  width: 350px;
  height: 100vh;
  background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
`;

export const Logo = styled.div`
  width: 40px;
  height: 40px;
  background: #ff9800;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

export const Title = styled.h1`
  color: white;
  font-size: 18px;
  font-weight: bold;
  line-height: 1.3;
`;

export const SearchBox = styled.div`
  position: relative;
  margin-bottom: 10px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  background: white;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  cursor: pointer;
`;

export const AutoCompleteContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const AutoCompleteItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background-color: #f5f5f5;
  }

  &:last-child {
    border-bottom: none;
  }

  &.highlighted {
    background-color: #e3f2fd;
  }
`;

export const HighlightedText = styled.span`
  color: #1976d2;
  font-weight: bold;
`;

export const LoadingItem = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  color: #999;
  text-align: center;
`;

export const NoResultsItem = styled.div`
  padding: 12px 16px;
  font-size: 14px;
  color: #999;
  text-align: center;
`;

export const TabContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 20px;
`;

export const Tab = styled.button`
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) =>
    props.active ? "rgba(255, 255, 255, 0.3)" : "transparent"};

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const FilterSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const FilterTitle = styled.h3`
  color: #333;
  font-size: 16px;
  margin-bottom: 15px;
`;

export const DropdownContainer = styled.div`
  margin-bottom: 20px;
`;

export const DropdownLabel = styled.label`
  color: #333;
  font-size: 14px;
  display: block;
  margin-bottom: 8px;
`;

export const Dropdown = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }

  &:hover {
    border-color: #bbb;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
    border-color: #e0e0e0;
  }
`;

export const SliderContainer = styled.div`
  margin-bottom: 25px;
`;

export const SliderLabel = styled.div`
  color: #333;
  font-size: 14px;
  margin-bottom: 15px;
`;

export const SliderValues = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 12px;
  margin-top: 8px;
`;

export const SearchButton = styled.button`
  width: 100%;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.4);
  }
`;

export const CategorySection = styled.div`
  margin-bottom: 25px;
`;

export const CategoryTitle = styled.h4`
  color: #333;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
`;

export const CheckboxContainer = styled.div`
  margin-bottom: 12px;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  padding: 8px 0;

  &:hover {
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 8px 4px;
  }
`;

export const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  margin-right: 12px;
  accent-color: #4CAF50;
  cursor: pointer;
`;

export const RangeInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

export const RangeInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
`;

export const RangeSeparator = styled.span`
  color: #666;
  font-weight: bold;
`;

export const IndicatorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
`;

export const IndicatorName = styled.span`
  color: #333;
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
  color: #666;
  font-size: 12px;
  white-space: nowrap;
`;

export const WeightInput = styled.input`
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
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
  color: #f44336;
  font-size: 12px;
  margin-left: 4px;
`;

export const StyledSearchButton = styled(SearchButton)`
  background: ${props => props.disabled 
    ? 'rgba(0, 0, 0, 0.2)' 
    : props.variant === 'success' 
      ? '#4caf50'
      : 'rgba(0, 0, 0, 0.3)'
  };
  
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background: ${props => props.disabled 
      ? 'rgba(0, 0, 0, 0.2)' 
      : props.variant === 'success' 
        ? '#45a049'
        : 'rgba(0, 0, 0, 0.4)'
    };
  }
  
  transition: all 0.3s ease;
`;