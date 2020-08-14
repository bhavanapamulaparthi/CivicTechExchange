// @flow

import type {VolunteerUserData, VolunteerDetailsAPIData} from "../../utils/ProjectAPIUtils.js";

export type BioPersonData = {|
  first_name: string,
  last_name: string,
  title: ?$ReadOnlyArray<string>,
  user_thumbnail: ?string,
  bio_text: ?string,
  profile_id: ?number
|};

export function VolunteerUserDataToBioPersonData(v: VolunteerUserData, title: string): BioPersonData {
    return {
      first_name: v.first_name,
      last_name: v.last_name,
      title: [title],
      user_thumbnail: v.user_thumbnail && v.user_thumbnail.publicUrl,
      bio_text: v.about_me,
      profile_id: v.id
    };
}

export function VolunteerDetailsAPIDataEqualsBioPersonData(v: VolunteerDetailsAPIData, b: BioPersonData): boolean {
  return VolunteerUserDataEqualsBioPersonData(v.user, b);
}

export function VolunteerUserDataEqualsBioPersonData(v: VolunteerUserData, b: BioPersonData): boolean {
  return (v.first_name === b.first_name) && (v.last_name === b.last_name);
}