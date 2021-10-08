import { Search } from "@mui/icons-material";
import { TextField, InputAdornment, TextFieldProps } from "@mui/material";

export default function SearchField(props: Omit<TextFieldProps,'onChange'> & { onChange?: (search: string) => void }){
    return (
      <TextField
        size="small"
        placeholder="Search"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        type="search"
        variant="outlined"
        {...props}
        onChange={(ev) => props.onChange?.(ev.target.value || '')}
      />
    )
}