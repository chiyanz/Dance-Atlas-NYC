import {
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

export function DropDownSelect(props: {
  label: string;
  options: Array<any>;
  state: any;
  setState: (value: any) => void;
  multiple?: boolean;
  render?: (value: any) => any;
  default?: any;
}) {
  return (
    <FormControl fullWidth>
      <InputLabel id="multiple-select-label">{props.label}</InputLabel>
      <Select
        labelId="multiple-select-label"
        multiple={props.multiple ?? true}
        defaultValue={props.default}
        value={props.state}
        disabled={!Boolean(props.options.length)}
        label={`select ${props.label}`}
        onChange={(evt) => {
          props.setState(evt.target.value);
        }}
        renderValue={props.render}
      >
        {props.options.map((option) => (
          <MenuItem value={option}>{option}</MenuItem>
        ))}
      </Select>
      <FormHelperText
        sx={{ margin: 0 }}
      >{`Filter by ${props.label}`}</FormHelperText>
    </FormControl>
  );
}

export function DateSelect(props: {
  state: Dayjs | null;
  setState: (date: Dayjs | null) => void;
}) {
  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={props.state}
          onChange={(date) => {
            props.setState(date);
          }}
        />
      </LocalizationProvider>
      <FormHelperText
        sx={{ margin: 0 }}
      >{`Filter by Start Date`}</FormHelperText>
    </div>
  );
}
