import usePlacesAutocomplete from "use-places-autocomplete";
import styles from "./PlacesAutocomplete.module.css";
import React, {FunctionComponent} from "react";


interface IProps {
    onAddressSelect?: (address: string) => void;
    placeholder: string | undefined;
}

const PlacesAutocomplete: FunctionComponent<IProps> = ({
                                onAddressSelect,
                                placeholder
                            }) => {
    const {
        ready,
        value,
        suggestions: {status, data},
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        //requestOptions: {componentRestrictions: {country: 'us'}},
        debounce: 500,
        cache: 86400,
    });

    const renderSuggestions = () => {
        return data.map((suggestion) => {
            const {
                place_id,
                structured_formatting: {main_text, secondary_text},
                description,
            } = suggestion;

            return (
                <li
                    key={place_id}
                    onClick={() => {
                        setValue(description, false);
                        clearSuggestions();
                        onAddressSelect && onAddressSelect(description);
                    }}
                >
                    <strong>{main_text}</strong> <small>{secondary_text}</small>
                </li>
            );
        });
    };

    return (
        <div className={styles.autocompleteWrapper}>
            <input
                value={value}
                className={styles.autocompleteInput}
                disabled={!ready}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
            />

            {status === 'OK' && (
                <ul className={styles.suggestionWrapper}>{renderSuggestions()}</ul>
            )}
        </div>
    );
};

export default PlacesAutocomplete;