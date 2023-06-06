import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../common/hooks';
import { Dropdown } from '../../../common/components/Dropdown';
import { SelectOption } from '../../../common/components/Select';
import { getParams } from '../../../features/params/paramsSlice';
import {
  generateNavigatorPath,
  navigatorParams,
  normalizeVersion,
} from '../common';
import { categorySelected, navigatorSelected } from '../navigatorSlice';
import classes from './NarrativeList.module.scss';

type NarrativeItemDropdownProps = {
  narrativeUPA: string;
  version: number;
  visible: boolean;
};

const NarrativeItemDropdown: FC<NarrativeItemDropdownProps> = ({
  narrativeUPA,
  version,
  visible,
}) => {
  const narrativeSelected = useAppSelector(navigatorSelected);
  const categorySet = useAppSelector(categorySelected);
  const europaParams = useAppSelector(getParams);
  const navigate = useNavigate();
  const [id, obj, ver] = narrativeUPA.split('/');
  const versionLatest = +ver;
  const [versionSelected] = (
    narrativeSelected ? narrativeSelected.split('/') : [null, null, null]
  ).slice(2);
  // After the hooks are used we may decide whether to show the dropdown.
  if (!visible) {
    return <div className={classes.dropdown_wrapper}></div>;
  }
  const categoryPath = categorySet !== 'own' ? categorySet : '';
  const navigatorParamsCurrent = Object.fromEntries(
    navigatorParams.map((param) => [param, europaParams[param]])
  );
  const versionPath = (version: number) => {
    return generateNavigatorPath({
      id,
      obj,
      categoryPath,
      extraParams: navigatorParamsCurrent,
      ver: version.toString(),
    });
  };

  const versionIsSelected = (
    version: number,
    versionSelected: string | null
  ) => {
    return versionSelected && version === +versionSelected;
  };
  const versionOptions = Array(versionLatest)
    .fill(null)
    .map((_, n) => n + 1)
    .reverse()
    .map((version) => {
      return {
        options: [
          {
            value: version,
            icon: undefined,
            label: (
              <>
                <span>v{version}</span>
                {versionIsSelected(version, versionSelected) && (
                  <FAIcon icon={faCheck} />
                )}
              </>
            ),
          },
        ],
      };
    });

  const handleDropdownChange = (event: SelectOption[]) => {
    const versionSelected = Number(normalizeVersion(event[0].value));
    const path = versionPath(versionSelected);
    navigate(path);
  };
  return (
    <div
      className={classes.dropdown_wrapper}
      onClick={(e) => {
        e.preventDefault();
      }}
    >
      <Dropdown
        className={classes.version_dropdown}
        horizontalMenuAlign="right"
        options={versionOptions}
        onChange={(e) => handleDropdownChange(e)}
      >
        {versionIsSelected(version, versionSelected) ? (
          <span>
            v{versionSelected} of {versionLatest}
          </span>
        ) : (
          <span>
            v{versionLatest} of {versionLatest}
          </span>
        )}
        <FAIcon icon={faCaretDown} style={{ marginLeft: '5px' }} />
      </Dropdown>
    </div>
  );
};

export default NarrativeItemDropdown;
