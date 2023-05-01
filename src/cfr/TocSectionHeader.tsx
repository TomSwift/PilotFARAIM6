import { SectionListData } from "react-native/types";
import { SdItem, SdItemGroup } from "../document/types";
function TocSectionHeader({ section }: { section: SectionListData<SdItem, SdItemGroup> }) {}

function renderSectionHeader({ section }: { section: SectionListData<SdItem, SdItemGroup> }) {
    // console.log(JSON.stringify(section));
    return (
        <View style={{ backgroundColor: "gray" }}>
            {Object.entries(section.parents).map(([key, item]) => {
                return <Text key={item.rowid.toString()}>{item.title}</Text>;
            })}
        </View>
    );
}
