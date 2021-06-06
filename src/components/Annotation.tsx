interface Data {
    id: number;
    start: number;
    end: number;
    subtitle: string;
}

const Annotation = (data: Array<Data>) => {
    const rendata = data.map((data, idx) => {
        return <td>
            <tr>{idx}</tr>
            <tr>{data.id}</tr>
            <tr>{data.start}</tr>
            <tr>{data.subtitle}</tr>
        </td>
    })
    return (
        <div>
            <table>
                {rendata}
            </table>
        </div>
    )
}

export default Annotation
