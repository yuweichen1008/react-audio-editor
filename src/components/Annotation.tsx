interface Data {
    id: number;
    start: number;
    end: number;
    subtitle: string;
}

const Annotation = ( ...data: Array<Data>) => {
    
    console.log("Annotation called with length " + data.length);
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Subtitle</th>
                    </tr>
                </thead>
                <tbody>
                    {data &&
                     data.map( entry => {
                         return(<tr key = {entry.id}>
                            <td>{entry.start}</td>
                            <td>{entry.end}</td>
                            <td>{entry.subtitle}</td>
                        </tr>)
                     })
                }
                </tbody>
            </table>
        </div>
    )
}

export default Annotation
